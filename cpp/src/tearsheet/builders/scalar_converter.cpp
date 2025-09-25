#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include <epoch_frame/scalar.h>
#include <arrow/type.h>

namespace epoch_tearsheet {

epoch_proto::Scalar ScalarFactory::create(const epoch_frame::Scalar& scalar) {
    epoch_proto::Scalar result;

    if (scalar.is_null()) {
        result.set_null_value(epoch_proto::NULL_VALUE);
        return result;
    }

    auto type = scalar.type();
    switch (type->id()) {
        case arrow::Type::BOOL:
            if (auto bool_scalar = scalar.cast(arrow::boolean()).as_bool()) {
                result.set_boolean_value(bool_scalar);
            }
            break;
        case arrow::Type::INT8:
        case arrow::Type::INT16:
        case arrow::Type::INT32:
        case arrow::Type::INT64:
        case arrow::Type::UINT8:
        case arrow::Type::UINT16:
        case arrow::Type::UINT32:
        case arrow::Type::UINT64:
            if (auto int_scalar = scalar.cast(arrow::int64()).as_int64()) {
                result.set_integer_value(int_scalar);
            }
            break;
        case arrow::Type::FLOAT:
        case arrow::Type::DOUBLE:
            if (auto double_scalar = scalar.cast(arrow::float64()).as_double()) {
                result.set_decimal_value(double_scalar);
            }
            break;
        case arrow::Type::STRING:
        case arrow::Type::LARGE_STRING:
            result.set_string_value(scalar.repr());
            break;
        case arrow::Type::TIMESTAMP:
            if (auto timestamp_scalar = scalar.cast(arrow::int64()).as_int64()) {
                result.set_timestamp_ms(timestamp_scalar / 1000000);
            }
            break;
        default:
            result.set_string_value(scalar.repr());
            break;
    }

    return result;
}

epoch_proto::Scalar ScalarFactory::fromBool(bool value) {
    epoch_proto::Scalar scalar;
    scalar.set_boolean_value(value);
    return scalar;
}

epoch_proto::Scalar ScalarFactory::fromInteger(int64_t value) {
    epoch_proto::Scalar scalar;
    scalar.set_integer_value(value);
    return scalar;
}

epoch_proto::Scalar ScalarFactory::fromDecimal(double value) {
    epoch_proto::Scalar scalar;
    scalar.set_decimal_value(value);
    return scalar;
}

epoch_proto::Scalar ScalarFactory::fromString(const std::string& value) {
    epoch_proto::Scalar scalar;
    scalar.set_string_value(value);
    return scalar;
}

epoch_proto::Scalar ScalarFactory::fromTimestamp(std::chrono::milliseconds ms) {
    epoch_proto::Scalar scalar;
    scalar.set_timestamp_ms(ms.count());
    return scalar;
}

epoch_proto::Scalar ScalarFactory::fromTimestamp(std::chrono::seconds s) {
    epoch_proto::Scalar scalar;
    scalar.set_timestamp_ms(std::chrono::duration_cast<std::chrono::milliseconds>(s).count());
    return scalar;
}

epoch_proto::Scalar ScalarFactory::null() {
    epoch_proto::Scalar scalar;
    scalar.set_null_value(epoch_proto::NULL_VALUE);
    return scalar;
}

} // namespace epoch_tearsheet
