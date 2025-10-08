#include <catch2/catch_test_macros.hpp>
#include <catch2/matchers/catch_matchers_string.hpp>
#include "epoch_dashboard/tearsheet/lines_chart_builder.h"
#include "epoch_dashboard/tearsheet/area_chart_builder.h"
#include "epoch_dashboard/tearsheet/bar_chart_builder.h"
#include "epoch_dashboard/tearsheet/histogram_chart_builder.h"
#include "epoch_dashboard/tearsheet/xrange_chart_builder.h"
#include "epoch_dashboard/tearsheet/line_builder.h"
#include "epoch_dashboard/tearsheet/validation_utils.h"

using namespace epoch_tearsheet;
using Catch::Matchers::ContainsSubstring;

TEST_CASE("ValidationUtils: Monotonic validation", "[validation]") {
    SECTION("Empty data is considered monotonic") {
        std::vector<epoch_proto::Point> points;
        REQUIRE(ValidationUtils::isMonotonicallyIncreasing(points));
    }

    SECTION("Single point is monotonic") {
        std::vector<epoch_proto::Point> points;
        epoch_proto::Point p1;
        p1.set_x(100);
        p1.set_y(1.0);
        points.push_back(p1);
        REQUIRE(ValidationUtils::isMonotonicallyIncreasing(points));
    }

    SECTION("Monotonically increasing data") {
        std::vector<epoch_proto::Point> points;
        for (int i = 0; i < 5; ++i) {
            epoch_proto::Point p;
            p.set_x(i * 1000);
            p.set_y(i * 0.1);
            points.push_back(p);
        }
        REQUIRE(ValidationUtils::isMonotonicallyIncreasing(points));
    }

    SECTION("Non-monotonic data") {
        std::vector<epoch_proto::Point> points;
        epoch_proto::Point p1, p2, p3;
        p1.set_x(1000);
        p2.set_x(500);  // Decreasing
        p3.set_x(1500);
        points.push_back(p1);
        points.push_back(p2);
        points.push_back(p3);
        REQUIRE_FALSE(ValidationUtils::isMonotonicallyIncreasing(points));
    }
}

TEST_CASE("ValidationUtils: Duplicate detection", "[validation]") {
    SECTION("No duplicates") {
        std::vector<epoch_proto::Point> points;
        for (int i = 0; i < 5; ++i) {
            epoch_proto::Point p;
            p.set_x(i * 1000);
            p.set_y(i * 0.1);
            points.push_back(p);
        }
        REQUIRE_FALSE(ValidationUtils::hasDuplicateXValues(points));
    }

    SECTION("Has duplicates") {
        std::vector<epoch_proto::Point> points;
        epoch_proto::Point p1, p2, p3;
        p1.set_x(1000);
        p2.set_x(1000);  // Duplicate
        p3.set_x(2000);
        points.push_back(p1);
        points.push_back(p2);
        points.push_back(p3);
        REQUIRE(ValidationUtils::hasDuplicateXValues(points));
    }
}

TEST_CASE("ValidationUtils: Finite values validation", "[validation]") {
    SECTION("All finite values pass") {
        std::vector<epoch_proto::Point> points;
        for (int i = 0; i < 3; ++i) {
            epoch_proto::Point p;
            p.set_x(i * 1000);
            p.set_y(i * 0.1);
            points.push_back(p);
        }
        REQUIRE_NOTHROW(ValidationUtils::validateFiniteValues(points));
    }

    SECTION("NaN value throws") {
        std::vector<epoch_proto::Point> points;
        epoch_proto::Point p;
        p.set_x(1000);
        p.set_y(std::numeric_limits<double>::quiet_NaN());
        points.push_back(p);
        REQUIRE_THROWS_WITH(
            ValidationUtils::validateFiniteValues(points),
            ContainsSubstring("NaN value found")
        );
    }

    SECTION("Infinite value throws") {
        std::vector<epoch_proto::Point> points;
        epoch_proto::Point p;
        p.set_x(1000);
        p.set_y(std::numeric_limits<double>::infinity());
        points.push_back(p);
        REQUIRE_THROWS_WITH(
            ValidationUtils::validateFiniteValues(points),
            ContainsSubstring("Infinite value found")
        );
    }
}

TEST_CASE("LinesChartBuilder: Monotonic validation", "[lines][validation]") {
    SECTION("Valid monotonic data builds successfully") {
        auto line = LineBuilder()
            .setName("Test")
            .addPoint(1000, 0.1)
            .addPoint(2000, 0.2)
            .addPoint(3000, 0.3)
            .build();

        auto chart = LinesChartBuilder()
            .setTitle("Valid Chart")
            .addLine(line)
            .build();

        REQUIRE(chart.has_lines_def());
        REQUIRE(chart.lines_def().lines_size() == 1);
    }

    SECTION("Non-monotonic data throws with strict validation") {
        auto line = LineBuilder()
            .setName("Test")
            .addPoint(3000, 0.3)
            .addPoint(1000, 0.1)  // Out of order
            .addPoint(2000, 0.2)
            .build();

        REQUIRE_THROWS_WITH(
            LinesChartBuilder()
                .setStrictValidation(true)
                .addLine(line),
            ContainsSubstring("monotonically increasing")
        );
    }

    SECTION("Non-monotonic data auto-sorts when enabled") {
        auto line = LineBuilder()
            .setName("Test")
            .addPoint(3000, 0.3)
            .addPoint(1000, 0.1)
            .addPoint(2000, 0.2)
            .build();

        auto chart = LinesChartBuilder()
            .setAutoSort(true)
            .addLine(line)
            .build();

        REQUIRE(chart.has_lines_def());
        REQUIRE(chart.lines_def().lines_size() == 1);

        // Verify data is sorted
        const auto& sorted_line = chart.lines_def().lines(0);
        REQUIRE(sorted_line.data_size() == 3);
        REQUIRE(sorted_line.data(0).x() == 1000);
        REQUIRE(sorted_line.data(1).x() == 2000);
        REQUIRE(sorted_line.data(2).x() == 3000);
    }

    SECTION("Duplicate x-values throw when not allowed") {
        auto line = LineBuilder()
            .setName("Test")
            .addPoint(1000, 0.1)
            .addPoint(1000, 0.2)  // Duplicate x
            .addPoint(2000, 0.3)
            .build();

        REQUIRE_THROWS_WITH(
            LinesChartBuilder()
                .setAllowDuplicates(false)
                .addLine(line),
            ContainsSubstring("Duplicate x-values")
        );
    }

    SECTION("Empty line throws with strict validation") {
        epoch_proto::Line empty_line;
        empty_line.set_name("Empty");

        REQUIRE_THROWS_WITH(
            LinesChartBuilder()
                .setStrictValidation(true)
                .addLine(empty_line),
            ContainsSubstring("Empty data")
        );
    }
}

TEST_CASE("AreaChartBuilder: Stacked validation", "[area][validation]") {
    SECTION("Stacked areas require same x-values") {
        auto area1 = LineBuilder()
            .setName("Area1")
            .addPoint(1000, 0.1)
            .addPoint(2000, 0.2)
            .build();

        auto area2 = LineBuilder()
            .setName("Area2")
            .addPoint(1000, 0.15)
            .addPoint(3000, 0.25)  // Different x-value
            .build();

        std::vector<epoch_proto::Line> areas = {area1, area2};

        REQUIRE_THROWS_WITH(
            AreaChartBuilder()
                .setStacked(true)
                .addAreas(areas),
            ContainsSubstring("Inconsistent")
        );
    }

    SECTION("Non-stacked areas allow different x-values") {
        auto area1 = LineBuilder()
            .setName("Area1")
            .addPoint(1000, 0.1)
            .addPoint(2000, 0.2)
            .build();

        auto area2 = LineBuilder()
            .setName("Area2")
            .addPoint(1500, 0.15)
            .addPoint(2500, 0.25)
            .build();

        auto chart = AreaChartBuilder()
            .setStacked(false)
            .addArea(area1)
            .addArea(area2)
            .build();

        REQUIRE(chart.has_area_def());
        REQUIRE(chart.area_def().areas_size() == 2);
    }
}

TEST_CASE("XRangeChartBuilder: Range validation", "[xrange][validation]") {
    SECTION("Valid range (x < x2) builds successfully") {
        auto chart = XRangeChartBuilder()
            .setTitle("XRange Chart")
            .addYCategory("Category1")
            .addPoint(1000, 2000, 0, true)
            .addPoint(2500, 3500, 0, false)
            .build();

        REQUIRE(chart.has_x_range_def());
        REQUIRE(chart.x_range_def().points_size() == 2);
    }

    SECTION("Invalid range (x >= x2) throws") {
        REQUIRE_THROWS_WITH(
            XRangeChartBuilder()
                .addPoint(2000, 1000, 0, true),  // x > x2
            ContainsSubstring("x (2000) must be less than x2 (1000)")
        );
    }

    SECTION("Equal values (x == x2) throws") {
        REQUIRE_THROWS_WITH(
            XRangeChartBuilder()
                .addPoint(1000, 1000, 0, true),  // x == x2
            ContainsSubstring("x (1000) must be less than x2 (1000)")
        );
    }
}

TEST_CASE("BarChartBuilder: Stacked bar validation", "[bar][validation]") {
    SECTION("Stacked bars don't allow negative values") {
        epoch_proto::BarData bar_data;
        bar_data.set_name("Test");
        bar_data.add_values(1.0);
        bar_data.add_values(-0.5);  // Negative value
        bar_data.add_values(2.0);

        REQUIRE_THROWS_WITH(
            BarChartBuilder()
                .setStacked(true)
                .addBarData(bar_data),
            ContainsSubstring("Negative value")
        );
    }

    SECTION("Non-stacked bars allow negative values") {
        epoch_proto::BarData bar_data;
        bar_data.set_name("Test");
        bar_data.add_values(1.0);
        bar_data.add_values(-0.5);
        bar_data.add_values(2.0);

        auto chart = BarChartBuilder()
            .setStacked(false)
            .addBarData(bar_data)
            .build();

        REQUIRE(chart.has_bar_def());
        REQUIRE(chart.bar_def().data_size() == 1);
    }

    SECTION("Empty bar data throws") {
        epoch_proto::BarData bar_data;
        bar_data.set_name("Empty");

        REQUIRE_THROWS_WITH(
            BarChartBuilder().addBarData(bar_data),
            ContainsSubstring("Empty bar data")
        );
    }
}

TEST_CASE("HistogramChartBuilder: Bins validation", "[histogram][validation]") {
    SECTION("Valid bins count") {
        epoch_proto::Array data;
        for (int i = 0; i < 100; ++i) {
            auto* val = data.add_values();
            val->set_decimal_value(i * 0.1);
        }

        auto chart = HistogramChartBuilder()
            .setTitle("Histogram")
            .setData(data)
            .setBinsCount(10)
            .build();

        REQUIRE(chart.has_histogram_def());
        REQUIRE(chart.histogram_def().bins_count() == 10);
    }

    SECTION("Zero bins throws") {
        epoch_proto::Array data;
        for (int i = 0; i < 10; ++i) {
            auto* val = data.add_values();
            val->set_decimal_value(i * 0.1);
        }

        auto builder = HistogramChartBuilder().setData(data);

        REQUIRE_THROWS_WITH(
            builder.setBinsCount(0),
            ContainsSubstring("bins_count must be greater than 0")
        );
    }

    SECTION("Bins count greater than data size throws") {
        epoch_proto::Array data;
        for (int i = 0; i < 5; ++i) {
            auto* val = data.add_values();
            val->set_decimal_value(i * 0.1);
        }

        auto builder = HistogramChartBuilder().setData(data);

        REQUIRE_THROWS_WITH(
            builder.setBinsCount(10),
            ContainsSubstring("cannot be greater than data size")
        );
    }

    SECTION("Empty data throws") {
        epoch_proto::Array empty_data;

        REQUIRE_THROWS_WITH(
            HistogramChartBuilder().setData(empty_data),
            ContainsSubstring("Cannot create histogram from empty data")
        );
    }
}

TEST_CASE("ValidationUtils: Error messages", "[validation]") {
    SECTION("Monotonic error message is descriptive") {
        std::vector<epoch_proto::Point> points;
        epoch_proto::Point p1, p2;
        p1.set_x(2000);
        p1.set_y(0.2);
        p2.set_x(1000);  // Out of order
        p2.set_y(0.1);
        points.push_back(p1);
        points.push_back(p2);

        auto error = ValidationUtils::getMonotonicErrorMessage(points);
        REQUIRE_THAT(error, ContainsSubstring("x[0]=2000 > x[1]=1000"));
        REQUIRE_THAT(error, ContainsSubstring("auto_sort"));
    }

    SECTION("Duplicate error message is descriptive") {
        std::vector<epoch_proto::Point> points;
        epoch_proto::Point p1, p2;
        p1.set_x(1000);
        p1.set_y(0.1);
        p2.set_x(1000);  // Duplicate
        p2.set_y(0.2);
        points.push_back(p1);
        points.push_back(p2);

        auto error = ValidationUtils::getDuplicateErrorMessage(points);
        REQUIRE_THAT(error, ContainsSubstring("Duplicate x-values detected"));
        REQUIRE_THAT(error, ContainsSubstring("position 1"));
        REQUIRE_THAT(error, ContainsSubstring("x=1000"));
    }
}