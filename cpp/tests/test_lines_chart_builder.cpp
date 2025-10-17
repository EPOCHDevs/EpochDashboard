#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/lines_chart_builder.h"
#include "epoch_dashboard/tearsheet/line_builder.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include <epoch_frame/dataframe.h>
#include <epoch_frame/index.h>
#include <epoch_frame/factory/index_factory.h>
#include <arrow/api.h>

using namespace epoch_tearsheet;
using namespace epoch_frame;

TEST_CASE("LinesChartBuilder: Basic construction", "[lines]") {
    auto chart = LinesChartBuilder()
        .setTitle("Performance Chart")
        .setCategory("Returns")
        .setXAxisLabel("Date")
        .setYAxisLabel("Return (%)")
        .build();

    REQUIRE(chart.has_lines_def());
    auto& chart_def = chart.lines_def().chart_def();
    REQUIRE(chart_def.type() == epoch_proto::WidgetLines);
    REQUIRE(chart_def.title() == "Performance Chart");
    REQUIRE(chart_def.category() == "Returns");
    REQUIRE(chart_def.x_axis().label() == "Date");
    REQUIRE(chart_def.y_axis().label() == "Return (%)");
}

TEST_CASE("LinesChartBuilder: Add single line", "[lines]") {
    auto line = LineBuilder()
        .setName("Returns")
        .addPoint(1000, 0.05)
        .addPoint(2000, 0.03)
        .addPoint(3000, 0.07)
        .build();

    auto chart = LinesChartBuilder()
        .setTitle("Returns")
        .addLine(line)
        .build();

    REQUIRE(chart.lines_def().lines_size() == 1);
    REQUIRE(chart.lines_def().lines(0).name() == "Returns");
    REQUIRE(chart.lines_def().lines(0).data_size() == 3);
}

TEST_CASE("LinesChartBuilder: Add multiple lines", "[lines]") {
    auto line1 = LineBuilder().setName("Strategy").addPoint(1, 10.0).build();
    auto line2 = LineBuilder().setName("Benchmark").addPoint(1, 5.0).build();

    auto chart = LinesChartBuilder()
        .setTitle("Comparison")
        .addLine(line1)
        .addLine(line2)
        .build();

    REQUIRE(chart.lines_def().lines_size() == 2);
    REQUIRE(chart.lines_def().lines(0).name() == "Strategy");
    REQUIRE(chart.lines_def().lines(1).name() == "Benchmark");
}

TEST_CASE("LinesChartBuilder: Add straight line", "[lines]") {
    epoch_proto::StraightLineDef straight;
    straight.set_title("Target");
    straight.set_value(0.10);
    straight.set_vertical(false);

    auto chart = LinesChartBuilder()
        .setTitle("With Target")
        .addStraightLine(straight)
        .build();

    REQUIRE(chart.lines_def().straight_lines_size() == 1);
    REQUIRE(chart.lines_def().straight_lines(0).title() == "Target");
    REQUIRE(chart.lines_def().straight_lines(0).value() == 0.10);
}

TEST_CASE("LinesChartBuilder: Add plot bands", "[lines]") {
    epoch_proto::Band y_band;
    *y_band.mutable_from() = ScalarFactory::fromDecimal(-0.05);
    *y_band.mutable_to() = ScalarFactory::fromDecimal(0.05);

    auto chart = LinesChartBuilder()
        .setTitle("With Bands")
        .addYPlotBand(y_band)
        .build();

    REQUIRE(chart.lines_def().y_plot_bands_size() == 1);
}

TEST_CASE("LinesChartBuilder: Set overlay", "[lines]") {
    auto overlay = LineBuilder()
        .setName("Overlay")
        .addPoint(1, 10.0)
        .build();

    auto chart = LinesChartBuilder()
        .setTitle("With Overlay")
        .setOverlay(overlay)
        .build();

    REQUIRE(chart.lines_def().has_overlay());
    REQUIRE(chart.lines_def().overlay().name() == "Overlay");
}

TEST_CASE("LinesChartBuilder: Stacked mode", "[lines]") {
    auto chart = LinesChartBuilder()
        .setTitle("Stacked Chart")
        .setStacked(true)
        .build();

    REQUIRE(chart.lines_def().stacked() == true);
}

TEST_CASE("DataFrameFactory: toMilliseconds conversion", "[dataframe]") {
    // Test the standalone conversion function
    int64_t test_value = 1640995200000000000LL; // 2022-01-01 00:00:00 in nanoseconds

    SECTION("Nanoseconds to milliseconds") {
        auto result = DataFrameFactory::toMilliseconds(test_value, arrow::TimeUnit::NANO);
        REQUIRE(result == 1640995200000LL);
    }

    SECTION("Microseconds to milliseconds") {
        auto result = DataFrameFactory::toMilliseconds(1640995200000000LL, arrow::TimeUnit::MICRO);
        REQUIRE(result == 1640995200000LL);
    }

    SECTION("Milliseconds to milliseconds") {
        auto result = DataFrameFactory::toMilliseconds(1640995200000LL, arrow::TimeUnit::MILLI);
        REQUIRE(result == 1640995200000LL);
    }

    SECTION("Seconds to milliseconds") {
        auto result = DataFrameFactory::toMilliseconds(1640995200LL, arrow::TimeUnit::SECOND);
        REQUIRE(result == 1640995200000LL);
    }

    SECTION("Default case (unknown unit) defaults to nanoseconds") {
        auto result = DataFrameFactory::toMilliseconds(test_value, static_cast<arrow::TimeUnit::type>(99));
        REQUIRE(result == 1640995200000LL);
    }
}