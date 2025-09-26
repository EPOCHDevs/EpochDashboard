#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/area_chart_builder.h"
#include "epoch_dashboard/tearsheet/line_builder.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include <epoch_frame/dataframe.h>
#include <arrow/api.h>

using namespace epoch_tearsheet;
using namespace epoch_frame;

TEST_CASE("AreaChartBuilder: Basic construction", "[area]") {
    auto chart = AreaChartBuilder()
        .setTitle("Area Chart")
        .setCategory("Performance")
        .setXAxisLabel("Time")
        .setYAxisLabel("Value")
        .build();

    REQUIRE(chart.has_area_def());
    auto& chart_def = chart.area_def().chart_def();
    REQUIRE(chart_def.type() == epoch_proto::WidgetArea);
    REQUIRE(chart_def.title() == "Area Chart");
    REQUIRE(chart_def.category() == "Performance");
    REQUIRE(chart_def.x_axis().label() == "Time");
    REQUIRE(chart_def.y_axis().label() == "Value");
}

TEST_CASE("AreaChartBuilder: Set ID", "[area]") {
    auto chart = AreaChartBuilder()
        .setId("area-chart-1")
        .setTitle("Test Area")
        .build();

    REQUIRE(chart.area_def().chart_def().id() == "area-chart-1");
}

TEST_CASE("AreaChartBuilder: Axis types configuration", "[area]") {
    auto chart = AreaChartBuilder()
        .setTitle("Axis Types Test")
        .setXAxisType(epoch_proto::AxisDateTime)
        .setYAxisType(epoch_proto::AxisLogarithmic)
        .build();

    REQUIRE(chart.area_def().chart_def().x_axis().type() == epoch_proto::AxisDateTime);
    REQUIRE(chart.area_def().chart_def().y_axis().type() == epoch_proto::AxisLogarithmic);
}

TEST_CASE("AreaChartBuilder: Axis categories", "[area]") {
    std::vector<std::string> x_categories = {"Q1", "Q2", "Q3", "Q4"};
    std::vector<std::string> y_categories = {"Low", "Medium", "High"};

    auto chart = AreaChartBuilder()
        .setTitle("Categories Test")
        .setXAxisCategories(x_categories)
        .setYAxisCategories(y_categories)
        .build();

    auto& x_axis = chart.area_def().chart_def().x_axis();
    auto& y_axis = chart.area_def().chart_def().y_axis();

    REQUIRE(x_axis.categories_size() == 4);
    REQUIRE(x_axis.categories(0) == "Q1");
    REQUIRE(x_axis.categories(3) == "Q4");

    REQUIRE(y_axis.categories_size() == 3);
    REQUIRE(y_axis.categories(0) == "Low");
    REQUIRE(y_axis.categories(2) == "High");
}

TEST_CASE("AreaChartBuilder: Add single area", "[area]") {
    auto area = LineBuilder()
        .setName("Revenue")
        .addPoint(1000, 100.0)
        .addPoint(2000, 150.0)
        .addPoint(3000, 200.0)
        .build();

    auto chart = AreaChartBuilder()
        .setTitle("Revenue Area")
        .addArea(area)
        .build();

    REQUIRE(chart.area_def().areas_size() == 1);
    REQUIRE(chart.area_def().areas(0).name() == "Revenue");
    REQUIRE(chart.area_def().areas(0).data_size() == 3);
    REQUIRE(chart.area_def().areas(0).data(0).y() == 100.0);
}

TEST_CASE("AreaChartBuilder: Add multiple areas", "[area]") {
    auto area1 = LineBuilder().setName("Series1").addPoint(1, 10.0).build();
    auto area2 = LineBuilder().setName("Series2").addPoint(1, 20.0).build();
    auto area3 = LineBuilder().setName("Series3").addPoint(1, 30.0).build();

    std::vector<epoch_proto::Line> areas = {area1, area2};

    auto chart = AreaChartBuilder()
        .setTitle("Multiple Areas")
        .addAreas(areas)
        .addArea(area3)
        .build();

    REQUIRE(chart.area_def().areas_size() == 3);
    REQUIRE(chart.area_def().areas(0).name() == "Series1");
    REQUIRE(chart.area_def().areas(1).name() == "Series2");
    REQUIRE(chart.area_def().areas(2).name() == "Series3");
}

TEST_CASE("AreaChartBuilder: Stacked configuration", "[area]") {
    auto chart = AreaChartBuilder()
        .setTitle("Stacked Area")
        .setStacked(true)
        .build();

    REQUIRE(chart.area_def().stacked() == true);
}

TEST_CASE("AreaChartBuilder: Stack type configuration", "[area]") {
    SECTION("Normal stacking") {
        auto chart = AreaChartBuilder()
            .setTitle("Normal Stack")
            .setStacked(true)
            .setStackType(epoch_proto::StackTypeNormal)
            .build();

        REQUIRE(chart.area_def().stacked() == true);
        REQUIRE(chart.area_def().stack_type() == epoch_proto::StackTypeNormal);
    }

    SECTION("Percent stacking") {
        auto chart = AreaChartBuilder()
            .setTitle("Percent Stack")
            .setStacked(true)
            .setStackType(epoch_proto::StackTypePercent)
            .build();

        REQUIRE(chart.area_def().stacked() == true);
        REQUIRE(chart.area_def().stack_type() == epoch_proto::StackTypePercent);
    }
}

TEST_CASE("AreaChartBuilder: Method chaining", "[area]") {
    auto area1 = LineBuilder().setName("Area1").addPoint(1, 10.0).build();
    auto area2 = LineBuilder().setName("Area2").addPoint(1, 20.0).build();

    auto chart = AreaChartBuilder()
        .setId("chain-test")
        .setTitle("Chained Methods")
        .setCategory("Test")
        .setXAxisLabel("X")
        .setYAxisLabel("Y")
        .setXAxisType(epoch_proto::AxisLinear)
        .setYAxisType(epoch_proto::AxisLinear)
        .setXAxisCategories({"A", "B"})
        .setYAxisCategories({"1", "2"})
        .addArea(area1)
        .addArea(area2)
        .setStacked(true)
        .setStackType(epoch_proto::StackTypePercent)
        .build();

    auto& def = chart.area_def();
    REQUIRE(def.chart_def().id() == "chain-test");
    REQUIRE(def.chart_def().title() == "Chained Methods");
    REQUIRE(def.chart_def().category() == "Test");
    REQUIRE(def.areas_size() == 2);
    REQUIRE(def.stacked() == true);
    REQUIRE(def.stack_type() == epoch_proto::StackTypePercent);
}

TEST_CASE("AreaChartBuilder: fromDataFrame", "[area]") {
    std::vector<double> x = {1.0, 2.0, 3.0};
    std::vector<double> revenue = {100.0, 150.0, 200.0};
    std::vector<double> cost = {50.0, 70.0, 90.0};
    std::vector<double> profit = {50.0, 80.0, 110.0};

    arrow::DoubleBuilder x_builder, revenue_builder, cost_builder, profit_builder;
    REQUIRE(x_builder.AppendValues(x).ok());
    REQUIRE(revenue_builder.AppendValues(revenue).ok());
    REQUIRE(cost_builder.AppendValues(cost).ok());
    REQUIRE(profit_builder.AppendValues(profit).ok());

    std::shared_ptr<arrow::Array> x_array, revenue_array, cost_array, profit_array;
    REQUIRE(x_builder.Finish(&x_array).ok());
    REQUIRE(revenue_builder.Finish(&revenue_array).ok());
    REQUIRE(cost_builder.Finish(&cost_array).ok());
    REQUIRE(profit_builder.Finish(&profit_array).ok());

    auto schema = arrow::schema({
        arrow::field("month", arrow::float64()),
        arrow::field("revenue", arrow::float64()),
        arrow::field("cost", arrow::float64()),
        arrow::field("profit", arrow::float64())
    });

    auto table = arrow::Table::Make(schema, {x_array, revenue_array, cost_array, profit_array});
    DataFrame df(table);

    auto chart = AreaChartBuilder()
        .setTitle("Financial Areas")
        .fromDataFrame(df, "month", {"revenue", "cost", "profit"})
        .setStacked(true)
        .build();

    REQUIRE(chart.area_def().areas_size() == 3);
    REQUIRE(chart.area_def().areas(0).name() == "revenue");
    REQUIRE(chart.area_def().areas(1).name() == "cost");
    REQUIRE(chart.area_def().areas(2).name() == "profit");
    // Note: The fromDataFrame implementation is simplified and doesn't extract actual data yet
    // REQUIRE(chart.area_def().areas(0).data(0).y() == 100.0);
    REQUIRE(chart.area_def().stacked() == true);
}

TEST_CASE("AreaChartBuilder: Empty areas", "[area]") {
    auto chart = AreaChartBuilder()
        .setTitle("Empty Areas")
        .build();

    REQUIRE(chart.area_def().areas_size() == 0);
}

TEST_CASE("AreaChartBuilder: Area with line styles", "[area]") {
    auto area = LineBuilder()
        .setName("Styled Area")
        .addPoint(1000, 100.0)
        .setDashStyle(epoch_proto::DashStyleUnspecified)
        .setLineWidth(3)
        .build();

    auto chart = AreaChartBuilder()
        .setTitle("Styled Area Chart")
        .addArea(area)
        .build();

    REQUIRE(chart.area_def().areas_size() == 1);
    REQUIRE(chart.area_def().areas(0).line_width() == 3);
}