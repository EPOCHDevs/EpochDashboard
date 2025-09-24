#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/heatmap_chart_builder.h"

using namespace epoch_tearsheet;

TEST_CASE("HeatMapChartBuilder: Basic construction", "[heatmap]") {
    auto chart = HeatMapChartBuilder()
        .setTitle("Correlation Matrix")
        .setCategory("Analysis")
        .setXAxisLabel("Asset A")
        .setYAxisLabel("Asset B")
        .build();

    REQUIRE(chart.has_heat_map_def());
    auto& chart_def = chart.heat_map_def().chart_def();
    REQUIRE(chart_def.type() == epoch_proto::WidgetHeatMap);
    REQUIRE(chart_def.title() == "Correlation Matrix");
    REQUIRE(chart_def.category() == "Analysis");
    REQUIRE(chart_def.x_axis().label() == "Asset A");
    REQUIRE(chart_def.y_axis().label() == "Asset B");
}

TEST_CASE("HeatMapChartBuilder: Add single point", "[heatmap]") {
    auto chart = HeatMapChartBuilder()
        .setTitle("Heat Map")
        .addPoint(0, 0, 0.95)
        .build();

    REQUIRE(chart.heat_map_def().points_size() == 1);
    REQUIRE(chart.heat_map_def().points(0).x() == 0);
    REQUIRE(chart.heat_map_def().points(0).y() == 0);
    REQUIRE(chart.heat_map_def().points(0).value() == 0.95);
}

TEST_CASE("HeatMapChartBuilder: Add multiple points", "[heatmap]") {
    auto chart = HeatMapChartBuilder()
        .setTitle("Correlation")
        .addPoint(0, 0, 1.0)
        .addPoint(0, 1, 0.75)
        .addPoint(1, 0, 0.75)
        .addPoint(1, 1, 1.0)
        .build();

    REQUIRE(chart.heat_map_def().points_size() == 4);
    REQUIRE(chart.heat_map_def().points(1).x() == 0);
    REQUIRE(chart.heat_map_def().points(1).y() == 1);
    REQUIRE(chart.heat_map_def().points(1).value() == 0.75);
}

TEST_CASE("HeatMapChartBuilder: Add points vector", "[heatmap]") {
    std::vector<epoch_proto::HeatMapPoint> points;

    epoch_proto::HeatMapPoint p1;
    p1.set_x(0);
    p1.set_y(0);
    p1.set_value(0.8);
    points.push_back(p1);

    epoch_proto::HeatMapPoint p2;
    p2.set_x(1);
    p2.set_y(1);
    p2.set_value(0.6);
    points.push_back(p2);

    auto chart = HeatMapChartBuilder()
        .setTitle("Batch Points")
        .addPoints(points)
        .build();

    REQUIRE(chart.heat_map_def().points_size() == 2);
    REQUIRE(chart.heat_map_def().points(0).value() == 0.8);
    REQUIRE(chart.heat_map_def().points(1).value() == 0.6);
}

TEST_CASE("HeatMapChartBuilder: Large correlation matrix", "[heatmap]") {
    auto builder = HeatMapChartBuilder()
        .setTitle("5x5 Correlation Matrix");

    for (uint64_t i = 0; i < 5; ++i) {
        for (uint64_t j = 0; j < 5; ++j) {
            double value = (i == j) ? 1.0 : 0.5 + (i * j * 0.05);
            builder.addPoint(i, j, value);
        }
    }

    auto chart = builder.build();
    REQUIRE(chart.heat_map_def().points_size() == 25);
}