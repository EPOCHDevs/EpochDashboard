#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/boxplot_chart_builder.h"

using namespace epoch_tearsheet;

TEST_CASE("BoxPlotChartBuilder: Basic construction", "[boxplot]") {
    auto chart = BoxPlotChartBuilder()
        .setTitle("Returns Distribution")
        .setCategory("Performance")
        .setXAxisLabel("Strategy")
        .setYAxisLabel("Return (%)")
        .build();

    REQUIRE(chart.has_box_plot_def());
    auto& chart_def = chart.box_plot_def().chart_def();
    REQUIRE(chart_def.type() == epoch_proto::WidgetBoxPlot);
    REQUIRE(chart_def.title() == "Returns Distribution");
    REQUIRE(chart_def.category() == "Performance");
    REQUIRE(chart_def.x_axis().label() == "Strategy");
    REQUIRE(chart_def.y_axis().label() == "Return (%)");
}

TEST_CASE("BoxPlotChartBuilder: Add outlier", "[boxplot]") {
    epoch_proto::BoxPlotOutlier outlier;
    outlier.set_category_index(0);
    outlier.set_value(0.25);

    auto chart = BoxPlotChartBuilder()
        .setTitle("With Outlier")
        .addOutlier(outlier)
        .build();

    REQUIRE(chart.box_plot_def().data().outliers_size() == 1);
    REQUIRE(chart.box_plot_def().data().outliers(0).category_index() == 0);
    REQUIRE(chart.box_plot_def().data().outliers(0).value() == 0.25);
}

TEST_CASE("BoxPlotChartBuilder: Add data point", "[boxplot]") {
    epoch_proto::BoxPlotDataPoint point;
    point.set_low(0.01);
    point.set_q1(0.03);
    point.set_median(0.05);
    point.set_q3(0.07);
    point.set_high(0.09);

    auto chart = BoxPlotChartBuilder()
        .setTitle("Box Plot")
        .addDataPoint(point)
        .build();

    REQUIRE(chart.box_plot_def().data().points_size() == 1);
    auto& dp = chart.box_plot_def().data().points(0);
    REQUIRE(dp.low() == 0.01);
    REQUIRE(dp.q1() == 0.03);
    REQUIRE(dp.median() == 0.05);
    REQUIRE(dp.q3() == 0.07);
    REQUIRE(dp.high() == 0.09);
}

TEST_CASE("BoxPlotChartBuilder: Multiple data points with outliers", "[boxplot]") {
    epoch_proto::BoxPlotDataPoint p1;
    p1.set_low(0.01);
    p1.set_q1(0.02);
    p1.set_median(0.03);
    p1.set_q3(0.04);
    p1.set_high(0.05);

    epoch_proto::BoxPlotDataPoint p2;
    p2.set_low(0.02);
    p2.set_q1(0.04);
    p2.set_median(0.06);
    p2.set_q3(0.08);
    p2.set_high(0.10);

    epoch_proto::BoxPlotOutlier o1;
    o1.set_category_index(0);
    o1.set_value(0.15);

    epoch_proto::BoxPlotOutlier o2;
    o2.set_category_index(1);
    o2.set_value(-0.05);

    auto chart = BoxPlotChartBuilder()
        .setTitle("Multiple Strategies")
        .addDataPoint(p1)
        .addDataPoint(p2)
        .addOutlier(o1)
        .addOutlier(o2)
        .build();

    REQUIRE(chart.box_plot_def().data().points_size() == 2);
    REQUIRE(chart.box_plot_def().data().outliers_size() == 2);
    REQUIRE(chart.box_plot_def().data().points(1).median() == 0.06);
    REQUIRE(chart.box_plot_def().data().outliers(1).value() == -0.05);
}