#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/line_builder.h"

using namespace epoch_tearsheet;

TEST_CASE("LineBuilder: Basic line construction", "[line]") {
    auto line = LineBuilder()
        .setName("Returns")
        .addPoint(1000, 0.05)
        .addPoint(2000, 0.03)
        .addPoint(3000, 0.07)
        .build();

    REQUIRE(line.name() == "Returns");
    REQUIRE(line.data_size() == 3);
    REQUIRE(line.data(0).x() == 1000);
    REQUIRE(line.data(0).y() == 0.05);
    REQUIRE(line.data(2).y() == 0.07);
}

TEST_CASE("LineBuilder: Set dash style", "[line]") {
    auto line = LineBuilder()
        .setName("Dashed Line")
        .setDashStyle(epoch_proto::Dash)
        .addPoint(1, 10.0)
        .build();

    REQUIRE(line.has_dash_style());
    REQUIRE(line.dash_style() == epoch_proto::Dash);
}

TEST_CASE("LineBuilder: Set line width", "[line]") {
    auto line = LineBuilder()
        .setName("Thick Line")
        .setLineWidth(5)
        .addPoint(1, 10.0)
        .build();

    REQUIRE(line.has_line_width());
    REQUIRE(line.line_width() == 5);
}

TEST_CASE("LineBuilder: Style combination", "[line]") {
    auto line = LineBuilder()
        .setName("Styled Line")
        .setDashStyle(epoch_proto::Dot)
        .setLineWidth(3)
        .addPoint(1, 5.0)
        .addPoint(2, 10.0)
        .build();

    REQUIRE(line.name() == "Styled Line");
    REQUIRE(line.dash_style() == epoch_proto::Dot);
    REQUIRE(line.line_width() == 3);
    REQUIRE(line.data_size() == 2);
}

TEST_CASE("LineBuilder: Add points vector", "[line]") {
    std::vector<epoch_proto::Point> points;

    epoch_proto::Point p1;
    p1.set_x(100);
    p1.set_y(0.01);
    points.push_back(p1);

    epoch_proto::Point p2;
    p2.set_x(200);
    p2.set_y(0.02);
    points.push_back(p2);

    epoch_proto::Point p3;
    p3.set_x(300);
    p3.set_y(0.03);
    points.push_back(p3);

    auto line = LineBuilder()
        .setName("Batch Points")
        .addPoints(points)
        .build();

    REQUIRE(line.data_size() == 3);
    REQUIRE(line.data(1).x() == 200);
    REQUIRE(line.data(1).y() == 0.02);
}

TEST_CASE("LineBuilder: Chained point addition", "[line]") {
    auto line = LineBuilder()
        .setName("Chained")
        .addPoint(1, 1.0)
        .addPoint(2, 2.0)
        .addPoint(3, 3.0)
        .addPoint(4, 4.0)
        .addPoint(5, 5.0)
        .build();

    REQUIRE(line.data_size() == 5);
    REQUIRE(line.data(4).x() == 5);
    REQUIRE(line.data(4).y() == 5.0);
}

TEST_CASE("LineBuilder: Empty line", "[line]") {
    auto line = LineBuilder()
        .setName("Empty")
        .build();

    REQUIRE(line.name() == "Empty");
    REQUIRE(line.data_size() == 0);
}

TEST_CASE("LineBuilder: Different dash styles", "[line]") {
    auto solid = LineBuilder()
        .setName("Solid")
        .setDashStyle(epoch_proto::Solid)
        .build();

    auto dash = LineBuilder()
        .setName("Dash")
        .setDashStyle(epoch_proto::Dash)
        .build();

    auto dot = LineBuilder()
        .setName("Dot")
        .setDashStyle(epoch_proto::Dot)
        .build();

    REQUIRE(solid.dash_style() == epoch_proto::Solid);
    REQUIRE(dash.dash_style() == epoch_proto::Dash);
    REQUIRE(dot.dash_style() == epoch_proto::Dot);
}