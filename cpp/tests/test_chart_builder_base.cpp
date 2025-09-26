#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/area_chart_builder.h"
#include "epoch_dashboard/tearsheet/bar_chart_builder.h"
#include "epoch_dashboard/tearsheet/lines_chart_builder.h"
#include "epoch_dashboard/tearsheet/histogram_chart_builder.h"
#include "epoch_dashboard/tearsheet/boxplot_chart_builder.h"
#include "epoch_dashboard/tearsheet/heatmap_chart_builder.h"
#include "epoch_dashboard/tearsheet/xrange_chart_builder.h"
#include "epoch_dashboard/tearsheet/pie_chart_builder.h"

using namespace epoch_tearsheet;

TEST_CASE("ChartBuilderBase: Common methods across all builders", "[base]") {
    SECTION("AreaChartBuilder inherits base methods") {
        auto chart = AreaChartBuilder()
            .setId("area-1")
            .setTitle("Area Title")
            .setCategory("Area Category")
            .setXAxisLabel("X Label")
            .setYAxisLabel("Y Label")
            .setXAxisType(epoch_proto::AxisLinear)
            .setYAxisType(epoch_proto::AxisLogarithmic)
            .build();

        auto& def = chart.area_def().chart_def();
        REQUIRE(def.id() == "area-1");
        REQUIRE(def.title() == "Area Title");
        REQUIRE(def.category() == "Area Category");
        REQUIRE(def.x_axis().label() == "X Label");
        REQUIRE(def.y_axis().label() == "Y Label");
        REQUIRE(def.x_axis().type() == epoch_proto::AxisLinear);
        REQUIRE(def.y_axis().type() == epoch_proto::AxisLogarithmic);
    }

    SECTION("BarChartBuilder inherits base methods") {
        auto chart = BarChartBuilder()
            .setId("bar-1")
            .setTitle("Bar Title")
            .setCategory("Bar Category")
            .setXAxisLabel("X Label")
            .setYAxisLabel("Y Label")
            .setXAxisType(epoch_proto::AxisCategory)
            .setYAxisType(epoch_proto::AxisLinear)
            .build();

        auto& def = chart.bar_def().chart_def();
        REQUIRE(def.id() == "bar-1");
        REQUIRE(def.title() == "Bar Title");
        REQUIRE(def.category() == "Bar Category");
        REQUIRE(def.x_axis().label() == "X Label");
        REQUIRE(def.y_axis().label() == "Y Label");
        REQUIRE(def.x_axis().type() == epoch_proto::AxisCategory);
        REQUIRE(def.y_axis().type() == epoch_proto::AxisLinear);
    }

    SECTION("LinesChartBuilder inherits base methods") {
        auto chart = LinesChartBuilder()
            .setId("lines-1")
            .setTitle("Lines Title")
            .setCategory("Lines Category")
            .setXAxisLabel("X Label")
            .setYAxisLabel("Y Label")
            .setXAxisType(epoch_proto::AxisDateTime)
            .setYAxisType(epoch_proto::AxisLinear)
            .build();

        auto& def = chart.lines_def().chart_def();
        REQUIRE(def.id() == "lines-1");
        REQUIRE(def.title() == "Lines Title");
        REQUIRE(def.category() == "Lines Category");
        REQUIRE(def.x_axis().label() == "X Label");
        REQUIRE(def.y_axis().label() == "Y Label");
        REQUIRE(def.x_axis().type() == epoch_proto::AxisDateTime);
        REQUIRE(def.y_axis().type() == epoch_proto::AxisLinear);
    }

    SECTION("HistogramChartBuilder inherits base methods") {
        auto chart = HistogramChartBuilder()
            .setId("hist-1")
            .setTitle("Histogram Title")
            .setCategory("Histogram Category")
            .setXAxisLabel("X Label")
            .setYAxisLabel("Y Label")
            .setXAxisType(epoch_proto::AxisLinear)
            .setYAxisType(epoch_proto::AxisLinear)
            .build();

        auto& def = chart.histogram_def().chart_def();
        REQUIRE(def.id() == "hist-1");
        REQUIRE(def.title() == "Histogram Title");
        REQUIRE(def.category() == "Histogram Category");
        REQUIRE(def.x_axis().label() == "X Label");
        REQUIRE(def.y_axis().label() == "Y Label");
        REQUIRE(def.x_axis().type() == epoch_proto::AxisLinear);
        REQUIRE(def.y_axis().type() == epoch_proto::AxisLinear);
    }

    SECTION("BoxPlotChartBuilder inherits base methods") {
        auto chart = BoxPlotChartBuilder()
            .setId("box-1")
            .setTitle("BoxPlot Title")
            .setCategory("BoxPlot Category")
            .setXAxisLabel("X Label")
            .setYAxisLabel("Y Label")
            .setXAxisType(epoch_proto::AxisCategory)
            .setYAxisType(epoch_proto::AxisLinear)
            .build();

        auto& def = chart.box_plot_def().chart_def();
        REQUIRE(def.id() == "box-1");
        REQUIRE(def.title() == "BoxPlot Title");
        REQUIRE(def.category() == "BoxPlot Category");
        REQUIRE(def.x_axis().label() == "X Label");
        REQUIRE(def.y_axis().label() == "Y Label");
        REQUIRE(def.x_axis().type() == epoch_proto::AxisCategory);
        REQUIRE(def.y_axis().type() == epoch_proto::AxisLinear);
    }

    SECTION("HeatMapChartBuilder inherits base methods") {
        auto chart = HeatMapChartBuilder()
            .setId("heat-1")
            .setTitle("HeatMap Title")
            .setCategory("HeatMap Category")
            .setXAxisLabel("X Label")
            .setYAxisLabel("Y Label")
            .setXAxisType(epoch_proto::AxisCategory)
            .setYAxisType(epoch_proto::AxisCategory)
            .build();

        auto& def = chart.heat_map_def().chart_def();
        REQUIRE(def.id() == "heat-1");
        REQUIRE(def.title() == "HeatMap Title");
        REQUIRE(def.category() == "HeatMap Category");
        REQUIRE(def.x_axis().label() == "X Label");
        REQUIRE(def.y_axis().label() == "Y Label");
        REQUIRE(def.x_axis().type() == epoch_proto::AxisCategory);
        REQUIRE(def.y_axis().type() == epoch_proto::AxisCategory);
    }

    SECTION("XRangeChartBuilder inherits base methods") {
        auto chart = XRangeChartBuilder()
            .setId("xrange-1")
            .setTitle("XRange Title")
            .setCategory("XRange Category")
            .setXAxisLabel("X Label")
            .setYAxisLabel("Y Label")
            .setXAxisType(epoch_proto::AxisDateTime)
            .setYAxisType(epoch_proto::AxisCategory)
            .build();

        auto& def = chart.x_range_def().chart_def();
        REQUIRE(def.id() == "xrange-1");
        REQUIRE(def.title() == "XRange Title");
        REQUIRE(def.category() == "XRange Category");
        REQUIRE(def.x_axis().label() == "X Label");
        REQUIRE(def.y_axis().label() == "Y Label");
        REQUIRE(def.x_axis().type() == epoch_proto::AxisDateTime);
        REQUIRE(def.y_axis().type() == epoch_proto::AxisCategory);
    }

    SECTION("PieChartBuilder inherits base methods") {
        auto chart = PieChartBuilder()
            .setId("pie-1")
            .setTitle("Pie Title")
            .setCategory("Pie Category")
            .build();

        auto& def = chart.pie_def().chart_def();
        REQUIRE(def.id() == "pie-1");
        REQUIRE(def.title() == "Pie Title");
        REQUIRE(def.category() == "Pie Category");
    }
}

TEST_CASE("ChartBuilderBase: Categories setting across builders", "[base]") {
    std::vector<std::string> x_cats = {"A", "B", "C"};
    std::vector<std::string> y_cats = {"1", "2", "3"};

    SECTION("AreaChartBuilder categories") {
        auto chart = AreaChartBuilder()
            .setXAxisCategories(x_cats)
            .setYAxisCategories(y_cats)
            .build();

        auto& x_axis = chart.area_def().chart_def().x_axis();
        auto& y_axis = chart.area_def().chart_def().y_axis();
        REQUIRE(x_axis.categories_size() == 3);
        REQUIRE(x_axis.categories(0) == "A");
        REQUIRE(y_axis.categories_size() == 3);
        REQUIRE(y_axis.categories(0) == "1");
    }

    SECTION("BarChartBuilder categories") {
        auto chart = BarChartBuilder()
            .setXAxisCategories(x_cats)
            .setYAxisCategories(y_cats)
            .build();

        auto& x_axis = chart.bar_def().chart_def().x_axis();
        auto& y_axis = chart.bar_def().chart_def().y_axis();
        REQUIRE(x_axis.categories_size() == 3);
        REQUIRE(x_axis.categories(1) == "B");
        REQUIRE(y_axis.categories_size() == 3);
        REQUIRE(y_axis.categories(1) == "2");
    }

    SECTION("HeatMapChartBuilder categories") {
        auto chart = HeatMapChartBuilder()
            .setXAxisCategories(x_cats)
            .setYAxisCategories(y_cats)
            .build();

        auto& x_axis = chart.heat_map_def().chart_def().x_axis();
        auto& y_axis = chart.heat_map_def().chart_def().y_axis();
        REQUIRE(x_axis.categories_size() == 3);
        REQUIRE(x_axis.categories(2) == "C");
        REQUIRE(y_axis.categories_size() == 3);
        REQUIRE(y_axis.categories(2) == "3");
    }
}

TEST_CASE("ChartBuilderBase: Method chaining returns correct type", "[base]") {
    SECTION("AreaChartBuilder chain") {
        AreaChartBuilder builder;
        auto& returned = builder.setTitle("Test").setCategory("Cat");
        REQUIRE(&returned == &builder);
    }

    SECTION("BarChartBuilder chain") {
        BarChartBuilder builder;
        auto& returned = builder.setTitle("Test").setCategory("Cat");
        REQUIRE(&returned == &builder);
    }

    SECTION("LinesChartBuilder chain") {
        LinesChartBuilder builder;
        auto& returned = builder.setTitle("Test").setCategory("Cat");
        REQUIRE(&returned == &builder);
    }
}

TEST_CASE("ChartBuilderBase: All axis types", "[base]") {
    SECTION("Linear axis") {
        auto chart = AreaChartBuilder()
            .setXAxisType(epoch_proto::AxisLinear)
            .setYAxisType(epoch_proto::AxisLinear)
            .build();
        REQUIRE(chart.area_def().chart_def().x_axis().type() == epoch_proto::AxisLinear);
        REQUIRE(chart.area_def().chart_def().y_axis().type() == epoch_proto::AxisLinear);
    }

    SECTION("Logarithmic axis") {
        auto chart = BarChartBuilder()
            .setXAxisType(epoch_proto::AxisLogarithmic)
            .setYAxisType(epoch_proto::AxisLogarithmic)
            .build();
        REQUIRE(chart.bar_def().chart_def().x_axis().type() == epoch_proto::AxisLogarithmic);
        REQUIRE(chart.bar_def().chart_def().y_axis().type() == epoch_proto::AxisLogarithmic);
    }

    SECTION("DateTime axis") {
        auto chart = LinesChartBuilder()
            .setXAxisType(epoch_proto::AxisDateTime)
            .setYAxisType(epoch_proto::AxisDateTime)
            .build();
        REQUIRE(chart.lines_def().chart_def().x_axis().type() == epoch_proto::AxisDateTime);
        REQUIRE(chart.lines_def().chart_def().y_axis().type() == epoch_proto::AxisDateTime);
    }

    SECTION("Category axis") {
        auto chart = HeatMapChartBuilder()
            .setXAxisType(epoch_proto::AxisCategory)
            .setYAxisType(epoch_proto::AxisCategory)
            .build();
        REQUIRE(chart.heat_map_def().chart_def().x_axis().type() == epoch_proto::AxisCategory);
        REQUIRE(chart.heat_map_def().chart_def().y_axis().type() == epoch_proto::AxisCategory);
    }
}

TEST_CASE("ChartBuilderBase: Empty categories", "[base]") {
    std::vector<std::string> empty_cats;

    auto chart = AreaChartBuilder()
        .setXAxisCategories(empty_cats)
        .setYAxisCategories(empty_cats)
        .build();

    REQUIRE(chart.area_def().chart_def().x_axis().categories_size() == 0);
    REQUIRE(chart.area_def().chart_def().y_axis().categories_size() == 0);
}

TEST_CASE("ChartBuilderBase: Overwrite categories", "[base]") {
    std::vector<std::string> first = {"A", "B"};
    std::vector<std::string> second = {"X", "Y", "Z"};

    auto chart = AreaChartBuilder()
        .setXAxisCategories(first)
        .setXAxisCategories(second)  // Should overwrite
        .build();

    auto& x_axis = chart.area_def().chart_def().x_axis();
    REQUIRE(x_axis.categories_size() == 3);
    REQUIRE(x_axis.categories(0) == "X");
    REQUIRE(x_axis.categories(1) == "Y");
    REQUIRE(x_axis.categories(2) == "Z");
}