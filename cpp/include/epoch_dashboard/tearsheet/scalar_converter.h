#pragma once

#include <string>
#include <chrono>

#include "epoch_protos/common.pb.h"

namespace epoch_frame {
    class Scalar;
}

namespace epoch_tearsheet {

class ScalarFactory {
public:
    static epoch_proto::Scalar create(const epoch_frame::Scalar& scalar);

    static epoch_proto::Scalar fromBool(bool value);
    static epoch_proto::Scalar fromInteger(int64_t value);
    static epoch_proto::Scalar fromDecimal(double value);
    static epoch_proto::Scalar fromString(const std::string& value);
    static epoch_proto::Scalar fromTimestamp(std::chrono::milliseconds ms);
    static epoch_proto::Scalar fromTimestamp(std::chrono::seconds s);
    static epoch_proto::Scalar null();
};

} // namespace epoch_tearsheet