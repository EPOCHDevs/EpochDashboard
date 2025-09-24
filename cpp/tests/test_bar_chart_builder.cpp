#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/bar_chart_builder.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include <epoch_frame/dataframe.h>
#include <arrow/api.h>

using namespace epoch_tearsheet;
using namespace epoch_frame;

TEST_CASE("BarChartBuilder: Basic construction", "[bar]") {
    auto chart = BarChartBuilder()
        .setTitle("Sales Chart")
        .setCategory("Revenue")
        .setXAxisLabel("Quarter")
        .setYAxisLabel("Sales ($)")
        .build();

    REQUIRE(chart.has_bar_def());
    auto& chart_def = chart.bar_def().chart_def();
    REQUIRE(chart_def.type() == epoch_proto::WidgetBar);
    REQUIRE(chart_def.title() == "Sales Chart");
    REQUIRE(chart_def.category() == "Revenue");
    REQUIRE(chart_def.x_axis().label() == "Quarter");
    REQUIRE(chart_def.y_axis().label() == "Sales ($)");
}

TEST_CASE("BarChartBuilder: Set data", "[bar]") {
    epoch_proto::Array data;
    *data.add_values() = ScalarFactory::fromDecimal(100.0);
    *data.add_values() = ScalarFactory::fromDecimal(200.0);
    *data.add_values() = ScalarFactory::fromDecimal(150.0);

    auto chart = BarChartBuilder()
        .setTitle("Data Chart")
        .setData(data)
        .build();

    REQUIRE(chart.bar_def().data().values_size() == 3);
    REQUIRE(chart.bar_def().data().values(0).decimal_value() == 100.0);
    REQUIRE(chart.bar_def().data().values(2).decimal_value() == 150.0);
}

TEST_CASE("BarChartBuilder: Add straight line", "[bar]") {
    epoch_proto::StraightLineDef straight;
    straight.set_title("Average");
    straight.set_value(175.0);
    straight.set_vertical(false);

    auto chart = BarChartBuilder()
        .setTitle("With Target")
        .addStraightLine(straight)
        .build();

    REQUIRE(chart.bar_def().straight_lines_size() == 1);
    REQUIRE(chart.bar_def().straight_lines(0).title() == "Average");
    REQUIRE(chart.bar_def().straight_lines(0).value() == 175.0);
}

TEST_CASE("BarChartBuilder: Set bar width", "[bar]") {
    auto chart = BarChartBuilder()
        .setTitle("Wide Bars")
        .setBarWidth(50)
        .build();

    REQUIRE(chart.bar_def().bar_width() == 50);
}

TEST_CASE("BarChartBuilder: Set vertical orientation", "[bar]") {
    auto chart = BarChartBuilder()
        .setTitle("Vertical Chart")
        .setVertical(true)
        .build();

    REQUIRE(chart.bar_def().vertical() == true);
}

TEST_CASE("BarChartBuilder: fromDataFrame", "[bar]") {
    std::vector<double> sales = {100.5, 200.3, 150.7};

    arrow::DoubleBuilder builder;
    REQUIRE(builder.AppendValues(sales).ok());

    std::shared_ptr<arrow::Array> array;
    REQUIRE(builder.Finish(&array).ok());

    auto schema = arrow::schema({arrow::field("sales", arrow::float64())});
    auto table = arrow::Table::Make(schema, {array});
    DataFrame df(table);

    auto chart = BarChartBuilder()
        .setTitle("Sales")
        .fromDataFrame(df, "sales")
        .build();

    REQUIRE(chart.bar_def().data().values_size() == 3);
    REQUIRE(chart.bar_def().data().values(0).decimal_value() == 100.5);
    REQUIRE(chart.bar_def().data().values(1).decimal_value() == 200.3);
}

TEST_CASE("BarChartBuilder: Horizontal bar chart", "[bar]") {
    auto chart = BarChartBuilder()
        .setTitle("Horizontal Bars")
        .setVertical(false)
        .setBarWidth(30)
        .build();

    REQUIRE(chart.bar_def().vertical() == false);
    REQUIRE(chart.bar_def().bar_width() == 30);
}