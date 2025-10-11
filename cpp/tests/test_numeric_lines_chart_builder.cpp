#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/numeric_lines_chart_builder.h"
#include "epoch_dashboard/tearsheet/numeric_line_builder.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include <epoch_frame/dataframe.h>
#include <epoch_frame/index.h>
#include <arrow/api.h>

using namespace epoch_tearsheet;
using namespace epoch_frame;

TEST_CASE("NumericLinesChartBuilder: Basic construction", "[numeric_lines]") {
    auto chart = NumericLinesChartBuilder()
        .setTitle("Numeric Performance Chart")
        .setCategory("Analysis")
        .setXAxisLabel("Iteration")
        .setYAxisLabel("Score")
        .build();

    REQUIRE(chart.has_numeric_lines_def());
    auto& chart_def = chart.numeric_lines_def().chart_def();
    REQUIRE(chart_def.type() == epoch_proto::WidgetLines);
    REQUIRE(chart_def.title() == "Numeric Performance Chart");
    REQUIRE(chart_def.category() == "Analysis");
    REQUIRE(chart_def.x_axis().label() == "Iteration");
    REQUIRE(chart_def.y_axis().label() == "Score");

    // Verify default axis types
    REQUIRE(chart_def.x_axis().type() == epoch_proto::AxisLinear);
    REQUIRE(chart_def.y_axis().type() == epoch_proto::AxisLinear);
}

TEST_CASE("NumericLinesChartBuilder: Add single line", "[numeric_lines]") {
    auto line = NumericLineBuilder()
        .setName("Accuracy")
        .addPoint(1.0, 0.75)
        .addPoint(2.0, 0.82)
        .addPoint(3.0, 0.89)
        .build();

    auto chart = NumericLinesChartBuilder()
        .setTitle("Model Accuracy")
        .addLine(line)
        .build();

    REQUIRE(chart.numeric_lines_def().lines_size() == 1);
    REQUIRE(chart.numeric_lines_def().lines(0).name() == "Accuracy");
    REQUIRE(chart.numeric_lines_def().lines(0).data_size() == 3);

    // Verify point values
    auto& points = chart.numeric_lines_def().lines(0).data();
    REQUIRE(points[0].x() == 1.0);
    REQUIRE(points[0].y() == 0.75);
    REQUIRE(points[1].x() == 2.0);
    REQUIRE(points[1].y() == 0.82);
}

TEST_CASE("NumericLinesChartBuilder: Add multiple lines", "[numeric_lines]") {
    auto line1 = NumericLineBuilder()
        .setName("Training")
        .addPoint(1.0, 10.0)
        .addPoint(2.0, 20.0)
        .build();

    auto line2 = NumericLineBuilder()
        .setName("Validation")
        .addPoint(1.0, 8.0)
        .addPoint(2.0, 18.0)
        .build();

    auto chart = NumericLinesChartBuilder()
        .setTitle("Training Progress")
        .addLine(line1)
        .addLine(line2)
        .build();

    REQUIRE(chart.numeric_lines_def().lines_size() == 2);
    REQUIRE(chart.numeric_lines_def().lines(0).name() == "Training");
    REQUIRE(chart.numeric_lines_def().lines(1).name() == "Validation");
}

TEST_CASE("NumericLinesChartBuilder: Add straight line", "[numeric_lines]") {
    epoch_proto::StraightLineDef straight;
    straight.set_title("Threshold");
    straight.set_value(0.80);
    straight.set_vertical(false);

    auto chart = NumericLinesChartBuilder()
        .setTitle("With Threshold")
        .addStraightLine(straight)
        .build();

    REQUIRE(chart.numeric_lines_def().straight_lines_size() == 1);
    REQUIRE(chart.numeric_lines_def().straight_lines(0).title() == "Threshold");
    REQUIRE(chart.numeric_lines_def().straight_lines(0).value() == 0.80);
}

TEST_CASE("NumericLinesChartBuilder: Add plot bands", "[numeric_lines]") {
    epoch_proto::Band y_band;
    *y_band.mutable_from() = ScalarFactory::fromDecimal(0.70);
    *y_band.mutable_to() = ScalarFactory::fromDecimal(0.90);

    epoch_proto::Band x_band;
    *x_band.mutable_from() = ScalarFactory::fromDecimal(5.0);
    *x_band.mutable_to() = ScalarFactory::fromDecimal(10.0);

    auto chart = NumericLinesChartBuilder()
        .setTitle("With Bands")
        .addYPlotBand(y_band)
        .addXPlotBand(x_band)
        .build();

    REQUIRE(chart.numeric_lines_def().y_plot_bands_size() == 1);
    REQUIRE(chart.numeric_lines_def().x_plot_bands_size() == 1);
}

TEST_CASE("NumericLinesChartBuilder: Set overlay", "[numeric_lines]") {
    auto overlay = NumericLineBuilder()
        .setName("Baseline")
        .addPoint(1.0, 50.0)
        .addPoint(2.0, 55.0)
        .build();

    auto chart = NumericLinesChartBuilder()
        .setTitle("With Overlay")
        .setOverlay(overlay)
        .build();

    REQUIRE(chart.numeric_lines_def().has_overlay());
    REQUIRE(chart.numeric_lines_def().overlay().name() == "Baseline");
}

TEST_CASE("NumericLinesChartBuilder: Stacked mode", "[numeric_lines]") {
    auto chart = NumericLinesChartBuilder()
        .setTitle("Stacked Chart")
        .setStacked(true)
        .build();

    REQUIRE(chart.numeric_lines_def().stacked() == true);
}

TEST_CASE("NumericLinesChartBuilder: Line styling", "[numeric_lines]") {
    auto line = NumericLineBuilder()
        .setName("Styled Line")
        .setDashStyle(epoch_proto::Dash)
        .setLineWidth(3)
        .addPoint(1.0, 10.0)
        .build();

    auto chart = NumericLinesChartBuilder()
        .setTitle("Styled Chart")
        .addLine(line)
        .build();

    REQUIRE(chart.numeric_lines_def().lines(0).dash_style() == epoch_proto::Dash);
    REQUIRE(chart.numeric_lines_def().lines(0).line_width() == 3);
}

// TODO: Add DataFrame tests when Index construction is clarified
// For now, focusing on basic builder functionality which is fully working

TEST_CASE("NumericLinesChartBuilder: Validation options", "[numeric_lines]") {
    ValidationUtils::ValidationOptions options;
    options.auto_sort = true;
    options.strict_validation = false;
    options.allow_duplicates = true;
    options.check_finite = false;

    auto chart = NumericLinesChartBuilder()
        .setTitle("With Custom Validation")
        .setValidationOptions(options)
        .build();

    // Just verify it builds without throwing
    REQUIRE(chart.has_numeric_lines_def());
}

TEST_CASE("NumericLinesChartBuilder: Individual validation setters", "[numeric_lines]") {
    auto chart = NumericLinesChartBuilder()
        .setTitle("Validation Test")
        .setAutoSort(true)
        .setStrictValidation(false)
        .setAllowDuplicates(true)
        .build();

    REQUIRE(chart.has_numeric_lines_def());
}