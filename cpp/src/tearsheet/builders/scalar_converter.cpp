#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include <epoch_frame/scalar.h>
#include <arrow/type.h>
#include <stdexcept>

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
            result.set_boolean_value(scalar.cast(arrow::boolean()).as_bool());
            break;
        case arrow::Type::INT8:
        case arrow::Type::INT16:
        case arrow::Type::INT32:
        case arrow::Type::INT64:
        case arrow::Type::UINT8:
        case arrow::Type::UINT16:
        case arrow::Type::UINT32:
        case arrow::Type::UINT64:
            result.set_integer_value(scalar.cast(arrow::int64()).as_int64());
            break;
        case arrow::Type::FLOAT:
        case arrow::Type::DOUBLE:
            result.set_decimal_value(scalar.cast(arrow::float64()).as_double());
            break;
        case arrow::Type::STRING:
        case arrow::Type::LARGE_STRING:
            result.set_string_value(scalar.repr());
            break;
        case arrow::Type::TIMESTAMP: {
            auto ts_type = std::static_pointer_cast<arrow::TimestampType>(type);
            auto unit = ts_type->unit();
            int64_t timestamp_value = scalar.cast(arrow::int64()).as_int64();

            // Convert to milliseconds based on the time unit
            switch (unit) {
                case arrow::TimeUnit::SECOND:
                    result.set_timestamp_ms(timestamp_value * 1000);
                    break;
                case arrow::TimeUnit::MILLI:
                    result.set_timestamp_ms(timestamp_value);
                    break;
                case arrow::TimeUnit::MICRO:
                    result.set_timestamp_ms(timestamp_value / 1000);
                    break;
                case arrow::TimeUnit::NANO:
                    result.set_timestamp_ms(timestamp_value / 1000000);
                    break;
            }
            break;
        }
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
