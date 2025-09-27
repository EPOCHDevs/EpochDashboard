#include <catch2/catch_test_macros.hpp>
#include <catch2/matchers/catch_matchers_floating_point.hpp>
#include "epoch_dashboard/tearsheet/series_converter.h"
#include <epoch_frame/series.h>
#include <epoch_frame/factory/series_factory.h>
#include <epoch_frame/factory/index_factory.h>
#include <arrow/api.h>

using namespace epoch_tearsheet;
using namespace epoch_frame;
using Catch::Matchers::WithinAbs;

class SeriesFactoryTest {
public:
    epoch_frame::IndexPtr createDefaultIndex(size_t size) {
        std::vector<int64_t> idx_values;
        for (size_t i = 0; i < size; ++i) {
            idx_values.push_back(static_cast<int64_t>(i));
        }
        arrow::Int64Builder builder;
        (void)builder.AppendValues(idx_values);
        auto idx_array = builder.Finish().ValueOrDie();
        return epoch_frame::factory::index::make_index(idx_array, std::nullopt, "index");
    }

    epoch_frame::IndexPtr createTimestampIndex(size_t size) {
        // Create timestamp values in nanoseconds (starting from Jan 1, 2022)
        std::vector<int64_t> timestamp_values;
        int64_t base_timestamp = 1640995200000000000LL; // 2022-01-01 00:00:00 in nanoseconds
        for (size_t i = 0; i < size; ++i) {
            timestamp_values.push_back(base_timestamp + i * 60000000000LL); // Add 1 minute per point
        }

        arrow::TimestampBuilder builder(arrow::timestamp(arrow::TimeUnit::NANO), arrow::default_memory_pool());
        (void)builder.AppendValues(timestamp_values);
        auto timestamp_array = builder.Finish().ValueOrDie();
        return epoch_frame::factory::index::make_index(timestamp_array, std::nullopt, "timestamp_index");
    }
};

TEST_CASE("SeriesFactory: toArray", "[series]") {
    SeriesFactoryTest fixture;
    std::vector<double> values = {1.0, 2.0, 3.0, 4.0, 5.0};
    auto series = epoch_frame::make_series(fixture.createDefaultIndex(values.size()), values);

    auto array = SeriesFactory::toArray(series);

    REQUIRE(array.values_size() == 5);
    for (int i = 0; i < 5; ++i) {
        auto scalar = array.values(i);
        REQUIRE(scalar.has_decimal_value());
        REQUIRE_THAT(scalar.decimal_value(), WithinAbs(values[i], 0.001));
    }
}


TEST_CASE("SeriesFactory: toPoint", "[series]") {
    SeriesFactoryTest fixture;
    std::vector<double> x_vals = {1.0, 2.0, 3.0};
    std::vector<double> y_vals = {10.0, 20.0, 30.0};

    auto x_series = epoch_frame::make_series(fixture.createDefaultIndex(x_vals.size()), x_vals);
    auto y_series = epoch_frame::make_series(fixture.createDefaultIndex(y_vals.size()), y_vals);

    auto point = SeriesFactory::toPoint(x_series, y_series, 1);

    REQUIRE(point.x() == 2);
    REQUIRE_THAT(point.y(), WithinAbs(20.0, 0.001));
}

TEST_CASE("SeriesFactory: toPoints", "[series]") {
    SeriesFactoryTest fixture;
    std::vector<double> x_vals = {1.0, 2.0, 3.0, 4.0};
    std::vector<double> y_vals = {5.0, 10.0, 15.0, 20.0};

    auto x_series = epoch_frame::make_series(fixture.createDefaultIndex(x_vals.size()), x_vals);
    auto y_series = epoch_frame::make_series(fixture.createDefaultIndex(y_vals.size()), y_vals);

    auto points = SeriesFactory::toPoints(x_series, y_series);

    REQUIRE(points.size() == 4);

    for (size_t i = 0; i < 4; ++i) {
        REQUIRE(points[i].x() == static_cast<int64_t>(x_vals[i]));
        REQUIRE_THAT(points[i].y(), WithinAbs(y_vals[i], 0.001));
    }
}

TEST_CASE("SeriesFactory: toPoints with mismatched sizes", "[series]") {
    SeriesFactoryTest fixture;
    std::vector<double> x_vals = {1.0, 2.0, 3.0};
    std::vector<double> y_vals = {5.0, 10.0, 15.0, 20.0, 25.0};

    auto x_series = epoch_frame::make_series(fixture.createDefaultIndex(x_vals.size()), x_vals);
    auto y_series = epoch_frame::make_series(fixture.createDefaultIndex(y_vals.size()), y_vals);

    auto points = SeriesFactory::toPoints(x_series, y_series);

    REQUIRE(points.size() == 3);
}

TEST_CASE("SeriesFactory: toTableRow", "[series]") {
    SeriesFactoryTest fixture;
    std::vector<double> values = {100.0, 200.0, 300.0};
    auto series = epoch_frame::make_series(fixture.createDefaultIndex(values.size()), values);

    auto row = SeriesFactory::toTableRow(series, 1);

    REQUIRE(row.values_size() == 1);
    REQUIRE(row.values(0).has_decimal_value());
    REQUIRE_THAT(row.values(0).decimal_value(), WithinAbs(200.0, 0.001));
}

TEST_CASE("SeriesFactory: toTableRows", "[series]") {
    SeriesFactoryTest fixture;
    std::vector<double> values = {1.5, 2.5, 3.5};
    auto series = epoch_frame::make_series(fixture.createDefaultIndex(values.size()), values);

    auto rows = SeriesFactory::toTableRows(series);

    REQUIRE(rows.size() == 3);

    for (size_t i = 0; i < 3; ++i) {
        REQUIRE(rows[i].values_size() == 1);
        REQUIRE(rows[i].values(0).has_decimal_value());
        REQUIRE_THAT(rows[i].values(0).decimal_value(), WithinAbs(values[i], 0.001));
    }
}

TEST_CASE("SeriesFactory: empty series", "[series]") {
    SeriesFactoryTest fixture;

    SECTION("toArray") {
        epoch_frame::Series empty_series;
        auto array = SeriesFactory::toArray(empty_series);
        REQUIRE(array.values_size() == 0);
    }

    SECTION("toLine") {
        // Create an empty series with proper timestamp index
        std::vector<double> empty_values;
        auto empty_series = epoch_frame::make_series(fixture.createTimestampIndex(0), empty_values);
        auto line = SeriesFactory::toLine(empty_series, "empty");
        REQUIRE(line.name() == "empty");
        REQUIRE(line.data_size() == 0);
    }

    SECTION("toTableRows") {
        epoch_frame::Series empty_series;
        auto rows = SeriesFactory::toTableRows(empty_series);
        REQUIRE(rows.empty());
    }
}

TEST_CASE("SeriesFactory: large series", "[series]") {
    SeriesFactoryTest fixture;
    std::vector<double> large_values;
    for (int i = 0; i < 1000; ++i) {
        large_values.push_back(i * 0.5);
    }

    auto series = epoch_frame::make_series(fixture.createDefaultIndex(large_values.size()), large_values);

    auto array = SeriesFactory::toArray(series);
    REQUIRE(array.values_size() == 1000);
}

TEST_CASE("SeriesFactory: toLine with style", "[series]") {
    SeriesFactoryTest fixture;
    std::vector<double> values = {10.0, 20.0, 30.0};
    auto series = epoch_frame::make_series(fixture.createTimestampIndex(values.size()), values);

    LineStyle style;
    style.dash_style = epoch_proto::Dash;
    style.line_width = 3;

    auto line = SeriesFactory::toLine(series, "styled_line", style);

    REQUIRE(line.name() == "styled_line");
    REQUIRE(line.has_dash_style());
    REQUIRE(line.dash_style() == epoch_proto::Dash);
    REQUIRE(line.has_line_width());
    REQUIRE(line.line_width() == 3);
    REQUIRE(line.data_size() == 3);

    // Check that timestamps were converted to milliseconds
    // Base timestamp 1640995200000000000LL nanoseconds = 1640995200000LL milliseconds
    REQUIRE(line.data(0).x() == 1640995200000LL);
    REQUIRE(line.data(1).x() == 1640995260000LL); // +1 minute
    REQUIRE(line.data(2).x() == 1640995320000LL); // +2 minutes
}

TEST_CASE("Series to proto types", "[series]") {
    SeriesFactoryTest fixture;
    std::vector<double> values = {5.0, 15.0, 25.0};
    auto series = epoch_frame::make_series(fixture.createDefaultIndex(values.size()), values);

    auto array = SeriesFactory::toArray(series);
    REQUIRE(array.values_size() == 3);
    REQUIRE(array.values(0).decimal_value() == 5.0);
}