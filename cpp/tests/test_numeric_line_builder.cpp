#include <catch2/catch_test_macros.hpp>
#include <catch2/matchers/catch_matchers_floating_point.hpp>
#include "epoch_dashboard/tearsheet/numeric_line_builder.h"
#include <epoch_frame/series.h>
#include <epoch_frame/factory/series_factory.h>
#include <epoch_frame/factory/index_factory.h>
#include <arrow/api.h>

using namespace epoch_tearsheet;

TEST_CASE("NumericLineBuilder: Basic line construction with double", "[numeric_line]") {
    auto line = NumericLineBuilder()
        .setName("Temperature")
        .addPoint(0.5, 25.3)
        .addPoint(1.2, 26.1)
        .addPoint(2.8, 24.7)
        .build();

    REQUIRE(line.name() == "Temperature");
    REQUIRE(line.data_size() == 3);
    REQUIRE_THAT(line.data(0).x(), Catch::Matchers::WithinRel(0.5, 1e-9));
    REQUIRE_THAT(line.data(0).y(), Catch::Matchers::WithinRel(25.3, 1e-9));
    REQUIRE_THAT(line.data(2).y(), Catch::Matchers::WithinRel(24.7, 1e-9));
}

TEST_CASE("NumericLineBuilder: Basic line construction with float", "[numeric_line]") {
    auto line = NumericLineBuilder()
        .setName("Pressure")
        .addPoint(1.5f, 101.3)
        .addPoint(2.0f, 102.1)
        .addPoint(3.5f, 100.8)
        .build();

    REQUIRE(line.name() == "Pressure");
    REQUIRE(line.data_size() == 3);
    REQUIRE_THAT(line.data(0).x(), Catch::Matchers::WithinRel(1.5, 1e-6));
    REQUIRE_THAT(line.data(1).x(), Catch::Matchers::WithinRel(2.0, 1e-6));
}

TEST_CASE("NumericLineBuilder: Set dash style", "[numeric_line]") {
    auto line = NumericLineBuilder()
        .setName("Dashed Line")
        .setDashStyle(epoch_proto::Dash)
        .addPoint(1.0, 10.0)
        .build();

    REQUIRE(line.has_dash_style());
    REQUIRE(line.dash_style() == epoch_proto::Dash);
}

TEST_CASE("NumericLineBuilder: Set line width", "[numeric_line]") {
    auto line = NumericLineBuilder()
        .setName("Thick Line")
        .setLineWidth(5)
        .addPoint(1.0, 10.0)
        .build();

    REQUIRE(line.has_line_width());
    REQUIRE(line.line_width() == 5);
}

TEST_CASE("NumericLineBuilder: Style combination", "[numeric_line]") {
    auto line = NumericLineBuilder()
        .setName("Styled Line")
        .setDashStyle(epoch_proto::Dot)
        .setLineWidth(3)
        .addPoint(1.5, 5.0)
        .addPoint(2.5, 10.0)
        .build();

    REQUIRE(line.name() == "Styled Line");
    REQUIRE(line.dash_style() == epoch_proto::Dot);
    REQUIRE(line.line_width() == 3);
    REQUIRE(line.data_size() == 2);
}

TEST_CASE("NumericLineBuilder: Add points vector", "[numeric_line]") {
    std::vector<epoch_proto::NumericPoint> points;

    epoch_proto::NumericPoint p1;
    p1.set_x(0.5);
    p1.set_y(0.01);
    points.push_back(p1);

    epoch_proto::NumericPoint p2;
    p2.set_x(1.5);
    p2.set_y(0.02);
    points.push_back(p2);

    epoch_proto::NumericPoint p3;
    p3.set_x(2.5);
    p3.set_y(0.03);
    points.push_back(p3);

    auto line = NumericLineBuilder()
        .setName("Batch Points")
        .addPoints(points)
        .build();

    REQUIRE(line.data_size() == 3);
    REQUIRE_THAT(line.data(1).x(), Catch::Matchers::WithinRel(1.5, 1e-9));
    REQUIRE_THAT(line.data(1).y(), Catch::Matchers::WithinRel(0.02, 1e-9));
}

TEST_CASE("NumericLineBuilder: Chained point addition", "[numeric_line]") {
    auto line = NumericLineBuilder()
        .setName("Chained")
        .addPoint(0.0, 1.0)
        .addPoint(0.5, 2.0)
        .addPoint(1.0, 3.0)
        .addPoint(1.5, 4.0)
        .addPoint(2.0, 5.0)
        .build();

    REQUIRE(line.data_size() == 5);
    REQUIRE_THAT(line.data(4).x(), Catch::Matchers::WithinRel(2.0, 1e-9));
    REQUIRE_THAT(line.data(4).y(), Catch::Matchers::WithinRel(5.0, 1e-9));
}

TEST_CASE("NumericLineBuilder: Empty line", "[numeric_line]") {
    auto line = NumericLineBuilder()
        .setName("Empty")
        .build();

    REQUIRE(line.name() == "Empty");
    REQUIRE(line.data_size() == 0);
}

TEST_CASE("NumericLineBuilder: Different dash styles", "[numeric_line]") {
    auto solid = NumericLineBuilder()
        .setName("Solid")
        .setDashStyle(epoch_proto::Solid)
        .build();

    auto dash = NumericLineBuilder()
        .setName("Dash")
        .setDashStyle(epoch_proto::Dash)
        .build();

    auto dot = NumericLineBuilder()
        .setName("Dot")
        .setDashStyle(epoch_proto::Dot)
        .build();

    REQUIRE(solid.dash_style() == epoch_proto::Solid);
    REQUIRE(dash.dash_style() == epoch_proto::Dash);
    REQUIRE(dot.dash_style() == epoch_proto::Dot);
}

// NOTE: Float/Double index tests are commented out due to Series constructor limitations
// The fromSeries method supports float/double indexes through the builder's addPoint template
// which enforces floating point types at compile time
//
// TEST_CASE("NumericLineBuilder: fromSeries with double index", "[numeric_line]") { ... }
// TEST_CASE("NumericLineBuilder: fromSeries with float index", "[numeric_line]") { ... }

TEST_CASE("NumericLineBuilder: fromSeries with int64 index converted to double", "[numeric_line]") {
    // Create an int64 index
    arrow::Int64Builder index_builder;
    REQUIRE(index_builder.Append(1).ok());
    REQUIRE(index_builder.Append(2).ok());
    REQUIRE(index_builder.Append(3).ok());

    std::shared_ptr<arrow::Array> index_array;
    REQUIRE(index_builder.Finish(&index_array).ok());

    auto index = epoch_frame::factory::index::make_index(index_array, std::nullopt, "index");

    // Create values
    std::vector<double> values = {10.0, 20.0, 30.0};

    // Create series
    auto series = epoch_frame::make_series(index, values, "counts");

    auto line = NumericLineBuilder()
        .fromSeries(series)
        .build();

    REQUIRE(line.data_size() == 3);
    REQUIRE_THAT(line.data(0).x(), Catch::Matchers::WithinRel(1.0, 1e-9));
    REQUIRE_THAT(line.data(0).y(), Catch::Matchers::WithinRel(10.0, 1e-9));
    REQUIRE_THAT(line.data(2).x(), Catch::Matchers::WithinRel(3.0, 1e-9));
}

TEST_CASE("NumericLineBuilder: fromSeries with uint64 index converted to double", "[numeric_line]") {
    // Create a uint64 index
    arrow::UInt64Builder index_builder;
    REQUIRE(index_builder.Append(10).ok());
    REQUIRE(index_builder.Append(20).ok());
    REQUIRE(index_builder.Append(30).ok());

    std::shared_ptr<arrow::Array> index_array;
    REQUIRE(index_builder.Finish(&index_array).ok());

    auto index = epoch_frame::factory::index::make_index(index_array, std::nullopt, "index");

    // Create values
    std::vector<double> values = {100.0, 200.0, 300.0};

    // Create series
    auto series = epoch_frame::make_series(index, values, "values");

    auto line = NumericLineBuilder()
        .fromSeries(series)
        .build();

    REQUIRE(line.data_size() == 3);
    REQUIRE_THAT(line.data(0).x(), Catch::Matchers::WithinRel(10.0, 1e-9));
    REQUIRE_THAT(line.data(1).x(), Catch::Matchers::WithinRel(20.0, 1e-9));
    REQUIRE_THAT(line.data(2).x(), Catch::Matchers::WithinRel(30.0, 1e-9));
}

TEST_CASE("NumericLineBuilder: fromSeries rejects timestamp index", "[numeric_line]") {
    // Create a timestamp index
    auto timestamp_type = arrow::timestamp(arrow::TimeUnit::MILLI);
    arrow::TimestampBuilder index_builder(timestamp_type, arrow::default_memory_pool());
    REQUIRE(index_builder.Append(1000).ok());
    REQUIRE(index_builder.Append(2000).ok());

    std::shared_ptr<arrow::Array> index_array;
    REQUIRE(index_builder.Finish(&index_array).ok());

    auto index = epoch_frame::factory::index::make_index(index_array, std::nullopt, "index");

    // Create values
    std::vector<double> values = {10.0, 20.0};

    // Create series
    auto series = epoch_frame::make_series(index, values, "timeseries");

    // Should throw because timestamp is not a valid index type for NumericLine
    REQUIRE_THROWS_AS(
        NumericLineBuilder().fromSeries(series),
        std::runtime_error
    );
}

TEST_CASE("NumericLineBuilder: Negative and zero values", "[numeric_line]") {
    auto line = NumericLineBuilder()
        .setName("Mixed Values")
        .addPoint(-1.5, -10.0)
        .addPoint(0.0, 0.0)
        .addPoint(1.5, 10.0)
        .build();

    REQUIRE(line.data_size() == 3);
    REQUIRE_THAT(line.data(0).x(), Catch::Matchers::WithinRel(-1.5, 1e-9));
    REQUIRE_THAT(line.data(0).y(), Catch::Matchers::WithinRel(-10.0, 1e-9));
    REQUIRE_THAT(line.data(1).x(), Catch::Matchers::WithinRel(0.0, 1e-9));
    REQUIRE_THAT(line.data(1).y(), Catch::Matchers::WithinRel(0.0, 1e-9));
}

TEST_CASE("NumericLineBuilder: Large floating point values", "[numeric_line]") {
    auto line = NumericLineBuilder()
        .setName("Large Values")
        .addPoint(1e10, 1e15)
        .addPoint(2e10, 2e15)
        .build();

    REQUIRE(line.data_size() == 2);
    REQUIRE_THAT(line.data(0).x(), Catch::Matchers::WithinRel(1e10, 1e-9));
    REQUIRE_THAT(line.data(0).y(), Catch::Matchers::WithinRel(1e15, 1e-9));
}
