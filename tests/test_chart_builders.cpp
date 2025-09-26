#include <gtest/gtest.h>
#include "epoch_dashboard/tearsheet/area_chart_builder.h"
#include "epoch_dashboard/tearsheet/bar_chart_builder.h"
#include "epoch_dashboard/tearsheet/lines_chart_builder.h"
#include "epoch_dashboard/tearsheet/histogram_chart_builder.h"
#include "epoch_dashboard/tearsheet/boxplot_chart_builder.h"
#include "epoch_dashboard/tearsheet/heatmap_chart_builder.h"
#include "epoch_dashboard/tearsheet/xrange_chart_builder.h"
#include "epoch_dashboard/tearsheet/pie_chart_builder.h"

using namespace epoch_tearsheet;

TEST(ChartBuilders, AreaChartBuilderCompiles) {
    AreaChartBuilder builder;
    builder.setTitle("Test Area Chart")
           .setCategory("Test Category")
           .setXAxisLabel("X Axis")
           .setYAxisLabel("Y Axis")
           .setXAxisType(epoch_proto::AxisLinear)
           .setYAxisType(epoch_proto::AxisLinear)
           .setStacked(true)
           .setStackType(epoch_proto::StackTypeNormal);

    auto chart = builder.build();
    ASSERT_TRUE(chart.has_area_def());
    EXPECT_EQ(chart.area_def().chart_def().title(), "Test Area Chart");
}

TEST(ChartBuilders, BarChartBuilderWithNewMethods) {
    BarChartBuilder builder;
    builder.setTitle("Test Bar Chart")
           .setCategory("Test Category")
           .setXAxisType(epoch_proto::AxisCategory)
           .setYAxisType(epoch_proto::AxisLinear)
           .setXAxisCategories({"Cat1", "Cat2", "Cat3"})
           .setStacked(true)
           .setStackType(epoch_proto::StackTypePercent);

    // Add BarData
    epoch_proto::BarData bar_data;
    bar_data.set_name("Series 1");
    bar_data.add_values(10.0);
    bar_data.add_values(20.0);
    bar_data.add_values(30.0);
    builder.addBarData(bar_data);

    auto chart = builder.build();
    ASSERT_TRUE(chart.has_bar_def());
    EXPECT_EQ(chart.bar_def().chart_def().title(), "Test Bar Chart");
    EXPECT_TRUE(chart.bar_def().stacked());
    EXPECT_EQ(chart.bar_def().stack_type(), epoch_proto::StackTypePercent);
    EXPECT_EQ(chart.bar_def().data_size(), 1);
}

TEST(ChartBuilders, AllBuildersHaveAxisMethods) {
    // Test that all builders have the common axis methods
    std::vector<std::string> categories = {"A", "B", "C"};

    {
        LinesChartBuilder builder;
        builder.setXAxisType(epoch_proto::AxisDateTime)
               .setYAxisType(epoch_proto::AxisLinear)
               .setXAxisCategories(categories);
    }

    {
        HistogramChartBuilder builder;
        builder.setXAxisType(epoch_proto::AxisLinear)
               .setYAxisType(epoch_proto::AxisLinear);
    }

    {
        BoxPlotChartBuilder builder;
        builder.setXAxisType(epoch_proto::AxisCategory)
               .setXAxisCategories(categories);
    }

    {
        HeatMapChartBuilder builder;
        builder.setXAxisCategories(categories)
               .setYAxisCategories(categories);
    }

    {
        XRangeChartBuilder builder;
        builder.setXAxisType(epoch_proto::AxisDateTime)
               .setYAxisType(epoch_proto::AxisCategory);
    }

    {
        PieChartBuilder builder;
        builder.setTitle("Pie Chart")
               .setCategory("Test");
    }
}