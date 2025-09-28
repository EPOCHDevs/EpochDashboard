#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/xrange_chart_builder.h"

using namespace epoch_tearsheet;

TEST_CASE("XRangeChartBuilder: Basic construction", "[xrange]") {
    auto chart = XRangeChartBuilder()
        .setTitle("Trade Timeline")
        .setCategory("Trading")
        .setXAxisLabel("Time")
        .setYAxisLabel("Position")
        .build();

    REQUIRE(chart.has_x_range_def());
    auto& chart_def = chart.x_range_def().chart_def();
    REQUIRE(chart_def.type() == epoch_proto::WidgetXRange);
    REQUIRE(chart_def.title() == "Trade Timeline");
    REQUIRE(chart_def.category() == "Trading");
    REQUIRE(chart_def.x_axis().label() == "Time");
    REQUIRE(chart_def.y_axis().label() == "Position");
}

TEST_CASE("XRangeChartBuilder: Add category", "[xrange]") {
    auto chart = XRangeChartBuilder()
        .setTitle("Categories")
        .addYCategory("Strategy A")
        .addYCategory("Strategy B")
        .build();

    REQUIRE(chart.x_range_def().categories_size() == 2);
    REQUIRE(chart.x_range_def().categories(0) == "Strategy A");
    REQUIRE(chart.x_range_def().categories(1) == "Strategy B");
}

TEST_CASE("XRangeChartBuilder: Add point with parameters", "[xrange]") {
    auto chart = XRangeChartBuilder()
        .setTitle("Positions")
        .addPoint(1000, 2000, 0, true)
        .build();

    REQUIRE(chart.x_range_def().points_size() == 1);
    auto& point = chart.x_range_def().points(0);
    REQUIRE(point.x() == 1000);
    REQUIRE(point.x2() == 2000);
    REQUIRE(point.y() == 0);
    REQUIRE(point.is_long() == true);
}

TEST_CASE("XRangeChartBuilder: Add point proto", "[xrange]") {
    epoch_proto::XRangePoint point;
    point.set_x(1500);
    point.set_x2(2500);
    point.set_y(1);
    point.set_is_long(false);

    auto chart = XRangeChartBuilder()
        .setTitle("Short Position")
        .addPoint(point)
        .build();

    REQUIRE(chart.x_range_def().points_size() == 1);
    auto& p = chart.x_range_def().points(0);
    REQUIRE(p.x() == 1500);
    REQUIRE(p.x2() == 2500);
    REQUIRE(p.y() == 1);
    REQUIRE(p.is_long() == false);
}

TEST_CASE("XRangeChartBuilder: Multiple ranges", "[xrange]") {
    auto chart = XRangeChartBuilder()
        .setTitle("Trade History")
        .addYCategory("AAPL")
        .addYCategory("GOOGL")
        .addPoint(1000, 1500, 0, true)
        .addPoint(1200, 1800, 1, false)
        .addPoint(2000, 2500, 0, false)
        .build();

    REQUIRE(chart.x_range_def().categories_size() == 2);
    REQUIRE(chart.x_range_def().points_size() == 3);
    REQUIRE(chart.x_range_def().points(0).is_long() == true);
    REQUIRE(chart.x_range_def().points(1).is_long() == false);
    REQUIRE(chart.x_range_def().points(1).y() == 1);
}

TEST_CASE("XRangeChartBuilder: Default is_long parameter", "[xrange]") {
    auto chart = XRangeChartBuilder()
        .setTitle("Default Long")
        .addPoint(100, 200, 0)
        .build();

    REQUIRE(chart.x_range_def().points_size() == 1);
    REQUIRE(chart.x_range_def().points(0).is_long() == false);
}