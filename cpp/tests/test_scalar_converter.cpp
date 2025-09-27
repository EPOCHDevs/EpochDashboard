#include <catch2/catch_test_macros.hpp>
#include <catch2/matchers/catch_matchers_floating_point.hpp>
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include <epoch_frame/scalar.h>
#include <arrow/api.h>
#include <chrono>

using namespace epoch_tearsheet;
using namespace epoch_frame;
using Catch::Matchers::WithinAbs;

TEST_CASE("ScalarFactory: Basic conversions", "[scalar]") {
    SECTION("fromBool") {
        auto proto_true = ScalarFactory::fromBool(true);
        REQUIRE(proto_true.has_boolean_value());
        REQUIRE(proto_true.boolean_value() == true);

        auto proto_false = ScalarFactory::fromBool(false);
        REQUIRE(proto_false.has_boolean_value());
        REQUIRE(proto_false.boolean_value() == false);
    }

    SECTION("fromInteger") {
        auto proto = ScalarFactory::fromInteger(42);
        REQUIRE(proto.has_integer_value());
        REQUIRE(proto.integer_value() == 42);

        auto proto_neg = ScalarFactory::fromInteger(-100);
        REQUIRE(proto_neg.has_integer_value());
        REQUIRE(proto_neg.integer_value() == -100);

        auto proto_max = ScalarFactory::fromInteger(9223372036854775807LL);
        REQUIRE(proto_max.has_integer_value());
        REQUIRE(proto_max.integer_value() == 9223372036854775807LL);
    }

    SECTION("fromDecimal") {
        auto proto = ScalarFactory::fromDecimal(3.14159);
        REQUIRE(proto.has_decimal_value());
        REQUIRE_THAT(proto.decimal_value(), WithinAbs(3.14159, 0.00001));

        auto proto_inf = ScalarFactory::fromDecimal(std::numeric_limits<double>::infinity());
        REQUIRE(proto_inf.has_decimal_value());
        REQUIRE(std::isinf(proto_inf.decimal_value()));
    }

    SECTION("fromString") {
        auto proto = ScalarFactory::fromString("Hello, World!");
        REQUIRE(proto.has_string_value());
        REQUIRE(proto.string_value() == "Hello, World!");

        auto proto_empty = ScalarFactory::fromString("");
        REQUIRE(proto_empty.has_string_value());
        REQUIRE(proto_empty.string_value() == "");
    }

    SECTION("fromTimestamp") {
        auto ms = std::chrono::milliseconds(1234567);
        auto proto_ms = ScalarFactory::fromTimestamp(ms);
        REQUIRE(proto_ms.has_timestamp_ms());
        REQUIRE(proto_ms.timestamp_ms() == 1234567);

        auto s = std::chrono::seconds(42);
        auto proto_s = ScalarFactory::fromTimestamp(s);
        REQUIRE(proto_s.has_timestamp_ms());
        REQUIRE(proto_s.timestamp_ms() == 42000);
    }

    SECTION("null") {
        auto proto = ScalarFactory::null();
        REQUIRE(proto.has_null_value());
        REQUIRE(proto.null_value() == epoch_proto::NULL_VALUE);
    }
}

TEST_CASE("ScalarFactory: epoch_frame::Scalar conversion", "[scalar]") {
    SECTION("double") {
        Scalar scalar(42.5);
        auto proto = ScalarFactory::create(scalar);
        REQUIRE(proto.has_decimal_value());
        REQUIRE_THAT(proto.decimal_value(), WithinAbs(42.5, 0.001));
    }

    SECTION("int64") {
        Scalar scalar(int64_t(100));
        auto proto = ScalarFactory::create(scalar);
        REQUIRE(proto.has_integer_value());
        REQUIRE(proto.integer_value() == 100);
    }

    SECTION("string") {
        Scalar scalar(std::string("test string"));
        auto proto = ScalarFactory::create(scalar);
        REQUIRE(proto.has_string_value());
        REQUIRE(proto.string_value() == "test string");
    }

    SECTION("bool") {
        Scalar scalar(true);
        auto proto = ScalarFactory::create(scalar);
        REQUIRE(proto.has_boolean_value());
        REQUIRE(proto.boolean_value() == true);
    }

    SECTION("null") {
        Scalar scalar; // default is null
        auto proto = ScalarFactory::create(scalar);
        REQUIRE(proto.has_null_value());
    }
}

TEST_CASE("ScalarFactory: comprehensive tests for bug fixes", "[scalar]") {
    SECTION("string uses repr()") {
        Scalar string_scalar(std::string("test string"));
        auto result = ScalarFactory::create(string_scalar);

        REQUIRE(result.has_string_value());
        REQUIRE(result.string_value() == "test string");
    }

    SECTION("large integers") {
        Scalar large_scalar(INT64_MAX);
        auto result = ScalarFactory::create(large_scalar);

        REQUIRE(result.has_integer_value());
        REQUIRE(result.integer_value() == INT64_MAX);
    }

    SECTION("cast operations work") {
        // Test different numeric types
        Scalar int_scalar(42);
        auto int_result = ScalarFactory::create(int_scalar);

        REQUIRE(int_result.has_integer_value());
        REQUIRE(int_result.integer_value() == 42);

        Scalar double_scalar(3.14159);
        auto double_result = ScalarFactory::create(double_scalar);

        REQUIRE(double_result.has_decimal_value());
        REQUIRE_THAT(double_result.decimal_value(), WithinAbs(3.14159, 0.00001));
    }

    SECTION("infinity handling") {
        Scalar inf_scalar(std::numeric_limits<double>::infinity());
        auto result = ScalarFactory::create(inf_scalar);

        REQUIRE(result.has_decimal_value());
        REQUIRE(std::isinf(result.decimal_value()));
    }
}