#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/pie_chart_builder.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include <epoch_frame/dataframe.h>
#include <arrow/api.h>

using namespace epoch_tearsheet;
using namespace epoch_frame;

TEST_CASE("PieChartBuilder: Basic construction", "[pie]") {
    auto chart = PieChartBuilder()
        .setTitle("Asset Allocation")
        .setCategory("Portfolio")
        .build();

    REQUIRE(chart.has_pie_def());
    auto& chart_def = chart.pie_def().chart_def();
    REQUIRE(chart_def.type() == epoch_proto::WidgetPie);
    REQUIRE(chart_def.title() == "Asset Allocation");
    REQUIRE(chart_def.category() == "Portfolio");
}

TEST_CASE("PieChartBuilder: Add series with pie size", "[pie]") {
    std::vector<epoch_proto::PieData> data;

    epoch_proto::PieData d1;
    d1.set_name("Stocks");
    d1.set_y(60.0);
    data.push_back(d1);

    epoch_proto::PieData d2;
    d2.set_name("Bonds");
    d2.set_y(40.0);
    data.push_back(d2);

    auto chart = PieChartBuilder()
        .setTitle("Allocation")
        .addSeries("Portfolio", data, PieSize(100))
        .build();

    REQUIRE(chart.pie_def().data_size() == 1);
    auto& series = chart.pie_def().data(0);
    REQUIRE(series.name() == "Portfolio");
    REQUIRE(series.size() == "100%");
    REQUIRE(series.points_size() == 2);
    REQUIRE(series.points(0).name() == "Stocks");
}

TEST_CASE("PieChartBuilder: Add series with inner size (donut)", "[pie]") {
    std::vector<epoch_proto::PieData> data;

    epoch_proto::PieData d1;
    d1.set_name("A");
    d1.set_y(50.0);
    data.push_back(d1);

    auto chart = PieChartBuilder()
        .setTitle("Donut Chart")
        .addSeries("Series", data, PieSize(80), PieInnerSize(40))
        .build();

    REQUIRE(chart.pie_def().data_size() == 1);
    auto& series = chart.pie_def().data(0);
    REQUIRE(series.size() == "80%");
    REQUIRE(series.inner_size() == "40%");
}

TEST_CASE("PieChartBuilder: fromDataFrame", "[pie]") {
    std::vector<std::string> names = {"Tech", "Finance", "Healthcare"};
    std::vector<double> values = {45.0, 30.0, 25.0};

    arrow::StringBuilder name_builder;
    arrow::DoubleBuilder value_builder;

    REQUIRE(name_builder.AppendValues(names).ok());
    REQUIRE(value_builder.AppendValues(values).ok());

    std::shared_ptr<arrow::Array> name_array, value_array;
    REQUIRE(name_builder.Finish(&name_array).ok());
    REQUIRE(value_builder.Finish(&value_array).ok());

    auto schema = arrow::schema({
        arrow::field("sector", arrow::utf8()),
        arrow::field("allocation", arrow::float64())
    });

    auto table = arrow::Table::Make(schema, {name_array, value_array});
    DataFrame df(table);

    auto chart = PieChartBuilder()
        .setTitle("Sector Allocation")
        .fromDataFrame(df, "sector", "allocation", "Portfolio", PieSize(100))
        .build();

    REQUIRE(chart.pie_def().data_size() == 1);
    auto& series = chart.pie_def().data(0);
    REQUIRE(series.name() == "Portfolio");
    REQUIRE(series.size() == "100%");
    REQUIRE(series.points_size() == 3);
    REQUIRE(series.points(0).name() == "Tech");
    REQUIRE(series.points(0).y() == 45.0);
}

TEST_CASE("PieChartBuilder: fromDataFrame with inner size", "[pie]") {
    std::vector<std::string> names = {"A", "B"};
    std::vector<double> values = {60.0, 40.0};

    arrow::StringBuilder name_builder;
    arrow::DoubleBuilder value_builder;

    REQUIRE(name_builder.AppendValues(names).ok());
    REQUIRE(value_builder.AppendValues(values).ok());

    std::shared_ptr<arrow::Array> name_array, value_array;
    REQUIRE(name_builder.Finish(&name_array).ok());
    REQUIRE(value_builder.Finish(&value_array).ok());

    auto schema = arrow::schema({
        arrow::field("name", arrow::utf8()),
        arrow::field("value", arrow::float64())
    });

    auto table = arrow::Table::Make(schema, {name_array, value_array});
    DataFrame df(table);

    auto chart = PieChartBuilder()
        .setTitle("Donut from DF")
        .fromDataFrame(df, "name", "value", "Data", PieSize(90), PieInnerSize(50))
        .build();

    REQUIRE(chart.pie_def().data_size() == 1);
    auto& series = chart.pie_def().data(0);
    REQUIRE(series.size() == "90%");
    REQUIRE(series.inner_size() == "50%");
}

TEST_CASE("PieChartBuilder: PieSize validation", "[pie]") {
    REQUIRE_NOTHROW(PieSize(0));
    REQUIRE_NOTHROW(PieSize(50));
    REQUIRE_NOTHROW(PieSize(100));
    REQUIRE_THROWS(PieSize(101));
    REQUIRE_THROWS(PieSize(200));
}

TEST_CASE("PieChartBuilder: Multiple series", "[pie]") {
    std::vector<epoch_proto::PieData> inner_data;
    epoch_proto::PieData d1;
    d1.set_name("Inner");
    d1.set_y(100.0);
    inner_data.push_back(d1);

    std::vector<epoch_proto::PieData> outer_data;
    epoch_proto::PieData d2;
    d2.set_name("Outer");
    d2.set_y(100.0);
    outer_data.push_back(d2);

    auto chart = PieChartBuilder()
        .setTitle("Nested Pies")
        .addSeries("Inner", inner_data, PieSize(50))
        .addSeries("Outer", outer_data, PieSize(100), PieInnerSize(60))
        .build();

    REQUIRE(chart.pie_def().data_size() == 2);
    REQUIRE(chart.pie_def().data(0).size() == "50%");
    REQUIRE(chart.pie_def().data(1).size() == "100%");
    REQUIRE(chart.pie_def().data(1).inner_size() == "60%");
}