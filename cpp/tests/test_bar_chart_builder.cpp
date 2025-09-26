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

    // setData now converts to BarData format
    REQUIRE(chart.bar_def().data_size() == 1);
    REQUIRE(chart.bar_def().data(0).values_size() == 3);
    REQUIRE(chart.bar_def().data(0).values(0) == 100.0);
    REQUIRE(chart.bar_def().data(0).values(2) == 150.0);
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

    REQUIRE(chart.bar_def().data_size() == 1);
    REQUIRE(chart.bar_def().data(0).values_size() == 3);
    REQUIRE(chart.bar_def().data(0).values(0) == 100.5);
    REQUIRE(chart.bar_def().data(0).values(1) == 200.3);
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

TEST_CASE("BarChartBuilder: Stacked configuration", "[bar]") {
    auto chart = BarChartBuilder()
        .setTitle("Stacked Bars")
        .setStacked(true)
        .build();

    REQUIRE(chart.bar_def().stacked() == true);
}

TEST_CASE("BarChartBuilder: Stack type configuration", "[bar]") {
    SECTION("Normal stacking") {
        auto chart = BarChartBuilder()
            .setTitle("Normal Stack")
            .setStacked(true)
            .setStackType(epoch_proto::StackTypeNormal)
            .build();

        REQUIRE(chart.bar_def().stacked() == true);
        REQUIRE(chart.bar_def().stack_type() == epoch_proto::StackTypeNormal);
    }

    SECTION("Percent stacking") {
        auto chart = BarChartBuilder()
            .setTitle("Percent Stack")
            .setStacked(true)
            .setStackType(epoch_proto::StackTypePercent)
            .build();

        REQUIRE(chart.bar_def().stacked() == true);
        REQUIRE(chart.bar_def().stack_type() == epoch_proto::StackTypePercent);
    }
}

TEST_CASE("BarChartBuilder: Add BarData", "[bar]") {
    epoch_proto::BarData data1;
    data1.set_name("Q1 Sales");
    data1.add_values(100.0);
    data1.add_values(150.0);
    data1.add_values(200.0);
    data1.set_stack("sales");

    epoch_proto::BarData data2;
    data2.set_name("Q2 Sales");
    data2.add_values(120.0);
    data2.add_values(180.0);
    data2.add_values(220.0);
    data2.set_stack("sales");

    auto chart = BarChartBuilder()
        .setTitle("Bar Data Test")
        .addBarData(data1)
        .addBarData(data2)
        .build();

    REQUIRE(chart.bar_def().data_size() == 2);
    REQUIRE(chart.bar_def().data(0).name() == "Q1 Sales");
    REQUIRE(chart.bar_def().data(0).values_size() == 3);
    REQUIRE(chart.bar_def().data(0).values(0) == 100.0);
    REQUIRE(chart.bar_def().data(0).stack() == "sales");
    REQUIRE(chart.bar_def().data(1).name() == "Q2 Sales");
    REQUIRE(chart.bar_def().data(1).values(2) == 220.0);
}

TEST_CASE("BarChartBuilder: Axis configuration", "[bar]") {
    std::vector<std::string> categories = {"Product A", "Product B", "Product C"};

    auto chart = BarChartBuilder()
        .setTitle("Axis Config Test")
        .setXAxisType(epoch_proto::AxisCategory)
        .setYAxisType(epoch_proto::AxisLinear)
        .setXAxisCategories(categories)
        .build();

    auto& x_axis = chart.bar_def().chart_def().x_axis();
    auto& y_axis = chart.bar_def().chart_def().y_axis();

    REQUIRE(x_axis.type() == epoch_proto::AxisCategory);
    REQUIRE(y_axis.type() == epoch_proto::AxisLinear);
    REQUIRE(x_axis.categories_size() == 3);
    REQUIRE(x_axis.categories(0) == "Product A");
    REQUIRE(x_axis.categories(1) == "Product B");
    REQUIRE(x_axis.categories(2) == "Product C");
}

TEST_CASE("BarChartBuilder: Complete stacked bar with multiple series", "[bar]") {
    std::vector<std::string> quarters = {"Q1", "Q2", "Q3", "Q4"};

    epoch_proto::BarData revenue;
    revenue.set_name("Revenue");
    revenue.add_values(100.0);
    revenue.add_values(120.0);
    revenue.add_values(140.0);
    revenue.add_values(160.0);
    revenue.set_stack("financial");

    epoch_proto::BarData costs;
    costs.set_name("Costs");
    costs.add_values(60.0);
    costs.add_values(70.0);
    costs.add_values(80.0);
    costs.add_values(90.0);
    costs.set_stack("financial");

    epoch_proto::BarData profit;
    profit.set_name("Profit");
    profit.add_values(40.0);
    profit.add_values(50.0);
    profit.add_values(60.0);
    profit.add_values(70.0);
    profit.set_stack("financial");

    auto chart = BarChartBuilder()
        .setId("stacked-bar-1")
        .setTitle("Quarterly Financial Performance")
        .setCategory("Finance")
        .setXAxisLabel("Quarter")
        .setYAxisLabel("Amount ($M)")
        .setXAxisType(epoch_proto::AxisCategory)
        .setYAxisType(epoch_proto::AxisLinear)
        .setXAxisCategories(quarters)
        .addBarData(revenue)
        .addBarData(costs)
        .addBarData(profit)
        .setStacked(true)
        .setStackType(epoch_proto::StackTypeNormal)
        .setBarWidth(40)
        .build();

    auto& def = chart.bar_def();
    REQUIRE(def.chart_def().id() == "stacked-bar-1");
    REQUIRE(def.chart_def().title() == "Quarterly Financial Performance");
    REQUIRE(def.data_size() == 3);
    REQUIRE(def.stacked() == true);
    REQUIRE(def.stack_type() == epoch_proto::StackTypeNormal);
    REQUIRE(def.bar_width() == 40);
    REQUIRE(def.chart_def().x_axis().categories_size() == 4);
}