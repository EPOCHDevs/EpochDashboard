#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/histogram_chart_builder.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include <epoch_frame/dataframe.h>
#include <arrow/api.h>

using namespace epoch_tearsheet;
using namespace epoch_frame;

TEST_CASE("HistogramChartBuilder: Basic construction", "[histogram]") {
    auto chart = HistogramChartBuilder()
        .setTitle("Returns Distribution")
        .setCategory("Performance")
        .setXAxisLabel("Return (%)")
        .setYAxisLabel("Frequency")
        .build();

    REQUIRE(chart.has_histogram_def());
    auto& chart_def = chart.histogram_def().chart_def();
    REQUIRE(chart_def.type() == epoch_proto::WidgetHistogram);
    REQUIRE(chart_def.title() == "Returns Distribution");
    REQUIRE(chart_def.category() == "Performance");
    REQUIRE(chart_def.x_axis().label() == "Return (%)");
    REQUIRE(chart_def.y_axis().label() == "Frequency");
}

TEST_CASE("HistogramChartBuilder: Set data", "[histogram]") {
    epoch_proto::Array data;
    *data.add_values() = ScalarFactory::fromDecimal(0.05);
    *data.add_values() = ScalarFactory::fromDecimal(0.03);
    *data.add_values() = ScalarFactory::fromDecimal(0.07);
    *data.add_values() = ScalarFactory::fromDecimal(0.02);

    auto chart = HistogramChartBuilder()
        .setTitle("Distribution")
        .setData(data)
        .build();

    REQUIRE(chart.histogram_def().data().values_size() == 4);
    REQUIRE(chart.histogram_def().data().values(0).decimal_value() == 0.05);
}

TEST_CASE("HistogramChartBuilder: Set bins count", "[histogram]") {
    auto chart = HistogramChartBuilder()
        .setTitle("Custom Bins")
        .setBinsCount(20)
        .build();

    REQUIRE(chart.histogram_def().bins_count() == 20);
}

TEST_CASE("HistogramChartBuilder: Add straight line", "[histogram]") {
    epoch_proto::StraightLineDef straight;
    straight.set_title("Mean");
    straight.set_value(0.05);
    straight.set_vertical(true);

    auto chart = HistogramChartBuilder()
        .setTitle("With Mean Line")
        .addStraightLine(straight)
        .build();

    REQUIRE(chart.histogram_def().straight_lines_size() == 1);
    REQUIRE(chart.histogram_def().straight_lines(0).title() == "Mean");
    REQUIRE(chart.histogram_def().straight_lines(0).vertical() == true);
}

TEST_CASE("HistogramChartBuilder: fromDataFrame with default bins", "[histogram]") {
    std::vector<double> returns = {0.01, 0.02, 0.03, -0.01, -0.02, 0.04, 0.05};

    arrow::DoubleBuilder builder;
    REQUIRE(builder.AppendValues(returns).ok());

    std::shared_ptr<arrow::Array> array;
    REQUIRE(builder.Finish(&array).ok());

    auto schema = arrow::schema({arrow::field("returns", arrow::float64())});
    auto table = arrow::Table::Make(schema, {array});
    DataFrame df(table);

    auto chart = HistogramChartBuilder()
        .setTitle("Returns Histogram")
        .fromDataFrame(df, "returns")
        .build();

    REQUIRE(chart.histogram_def().data().values_size() == 7);
    REQUIRE(chart.histogram_def().bins_count() == 30);
}

TEST_CASE("HistogramChartBuilder: fromDataFrame with custom bins", "[histogram]") {
    std::vector<double> data = {1.0, 2.0, 3.0, 4.0, 5.0};

    arrow::DoubleBuilder builder;
    REQUIRE(builder.AppendValues(data).ok());

    std::shared_ptr<arrow::Array> array;
    REQUIRE(builder.Finish(&array).ok());

    auto schema = arrow::schema({arrow::field("values", arrow::float64())});
    auto table = arrow::Table::Make(schema, {array});
    DataFrame df(table);

    auto chart = HistogramChartBuilder()
        .setTitle("Custom Bins")
        .fromDataFrame(df, "values", 15)
        .build();

    REQUIRE(chart.histogram_def().data().values_size() == 5);
    REQUIRE(chart.histogram_def().bins_count() == 15);
}