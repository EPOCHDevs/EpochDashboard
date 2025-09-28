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

TEST_CASE("ScalarFactory: New specialized factory methods", "[scalar]") {
    SECTION("fromDateValue") {
        int64_t milliseconds = 1609459200000; // 2021-01-01 00:00:00 UTC in ms
        auto proto = ScalarFactory::fromDateValue(milliseconds);
        REQUIRE(proto.has_date_value());
        REQUIRE(proto.date_value() == milliseconds);
    }

    SECTION("fromDayDuration") {
        int32_t days = 30;
        auto proto = ScalarFactory::fromDayDuration(days);
        REQUIRE(proto.has_day_duration());
        REQUIRE(proto.day_duration() == days);
    }

    SECTION("fromDurationMs") {
        int64_t ms = 123456789;
        auto proto = ScalarFactory::fromDurationMs(ms);
        REQUIRE(proto.has_duration_ms());
        REQUIRE(proto.duration_ms() == ms);
    }

    SECTION("fromMonetaryValue") {
        double amount = 1234.56;
        auto proto = ScalarFactory::fromMonetaryValue(amount);
        REQUIRE(proto.has_monetary_value());
        REQUIRE_THAT(proto.monetary_value(), WithinAbs(amount, 0.01));
    }

    SECTION("fromPercentValue") {
        double percentage = 85.75;
        auto proto = ScalarFactory::fromPercentValue(percentage);
        REQUIRE(proto.has_percent_value());
        REQUIRE_THAT(proto.percent_value(), WithinAbs(percentage, 0.01));
    }

}

TEST_CASE("ScalarFactory: Arrow date and duration type conversions", "[scalar]") {
    SECTION("DATE32 conversion") {
        // Create a DATE32 scalar (days since epoch)
        int32_t days = 18628; // 2021-01-01
        auto date32_type = arrow::date32();
        auto date32_scalar = arrow::MakeScalar(date32_type, days);

        Scalar epoch_scalar(*date32_scalar);
        auto result = ScalarFactory::create(epoch_scalar);

        REQUIRE(result.has_date_value());
        // Should convert days to milliseconds: days * 24 * 60 * 60 * 1000
        REQUIRE(result.date_value() == static_cast<int64_t>(days) * 24 * 60 * 60 * 1000);
    }

    SECTION("DATE64 conversion") {
        // Create a DATE64 scalar (milliseconds since epoch)
        int64_t ms = 1609459200000; // 2021-01-01 00:00:00 UTC in ms
        auto date64_type = arrow::date64();
        auto date64_scalar = arrow::MakeScalar(date64_type, ms);

        Scalar epoch_scalar(*date64_scalar);
        auto result = ScalarFactory::create(epoch_scalar);

        REQUIRE(result.has_date_value());
        // Should keep milliseconds as-is
        REQUIRE(result.date_value() == ms);
    }

    SECTION("DURATION conversion - seconds") {
        // Create a DURATION scalar with second unit
        int64_t duration_seconds = 3600; // 1 hour
        auto duration_type = arrow::duration(arrow::TimeUnit::SECOND);
        auto duration_scalar = arrow::MakeScalar(duration_type, duration_seconds);

        Scalar epoch_scalar(*duration_scalar);
        auto result = ScalarFactory::create(epoch_scalar);

        REQUIRE(result.has_duration_ms());
        // Should convert seconds to milliseconds
        REQUIRE(result.duration_ms() == duration_seconds * 1000);
    }

    SECTION("DURATION conversion - milliseconds") {
        // Create a DURATION scalar with millisecond unit
        int64_t duration_ms = 123456;
        auto duration_type = arrow::duration(arrow::TimeUnit::MILLI);
        auto duration_scalar = arrow::MakeScalar(duration_type, duration_ms);

        Scalar epoch_scalar(*duration_scalar);
        auto result = ScalarFactory::create(epoch_scalar);

        REQUIRE(result.has_duration_ms());
        REQUIRE(result.duration_ms() == duration_ms);
    }

    SECTION("DURATION conversion - microseconds") {
        // Create a DURATION scalar with microsecond unit
        int64_t duration_us = 123456789; // microseconds
        auto duration_type = arrow::duration(arrow::TimeUnit::MICRO);
        auto duration_scalar = arrow::MakeScalar(duration_type, duration_us);

        Scalar epoch_scalar(*duration_scalar);
        auto result = ScalarFactory::create(epoch_scalar);

        REQUIRE(result.has_duration_ms());
        // Should convert microseconds to milliseconds
        REQUIRE(result.duration_ms() == duration_us / 1000);
    }

    SECTION("DURATION conversion - nanoseconds") {
        // Create a DURATION scalar with nanosecond unit
        int64_t duration_ns = 123456789000; // nanoseconds
        auto duration_type = arrow::duration(arrow::TimeUnit::NANO);
        auto duration_scalar = arrow::MakeScalar(duration_type, duration_ns);

        Scalar epoch_scalar(*duration_scalar);
        auto result = ScalarFactory::create(epoch_scalar);

        REQUIRE(result.has_duration_ms());
        // Should convert nanoseconds to milliseconds
        REQUIRE(result.duration_ms() == duration_ns / 1000000);
    }
}

TEST_CASE("ScalarFactory: Default fallback conversion", "[scalar]") {
    SECTION("Unknown type fallback") {
        // Test that unknown types fall back to string representation
        // This tests the default case in the switch statement
        Scalar string_scalar(std::string("fallback test"));
        auto result = ScalarFactory::create(string_scalar);

        REQUIRE(result.has_string_value());
        REQUIRE(result.string_value() == "fallback test");
    }
}