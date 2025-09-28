#pragma once

#include <string>
#include <chrono>

#include "epoch_protos/common.pb.h"

namespace epoch_frame {
    class Scalar;
    struct Date;
    class DateTime;
}

namespace epoch_tearsheet {

class ScalarFactory {
public:
    static epoch_proto::Scalar create(const epoch_frame::Scalar& scalar);

    // Basic types
    static epoch_proto::Scalar fromBool(bool value);
    static epoch_proto::Scalar fromInteger(int64_t value);
    static epoch_proto::Scalar fromDecimal(double value);
    static epoch_proto::Scalar fromString(const std::string& value);
    static epoch_proto::Scalar fromTimestamp(std::chrono::milliseconds ms);
    static epoch_proto::Scalar fromTimestamp(std::chrono::seconds s);
    static epoch_proto::Scalar fromDate(const epoch_frame::Date& date);
    static epoch_proto::Scalar fromDateTime(const epoch_frame::DateTime& datetime);
    static epoch_proto::Scalar null();

    // Additional specialized types
    static epoch_proto::Scalar fromDateValue(int64_t milliseconds_since_epoch);
    static epoch_proto::Scalar fromDayDuration(int32_t days);
    static epoch_proto::Scalar fromDurationMs(int64_t milliseconds);
    static epoch_proto::Scalar fromMonetaryValue(double amount);
    static epoch_proto::Scalar fromPercentValue(double percentage);
};

} // namespace epoch_tearsheet