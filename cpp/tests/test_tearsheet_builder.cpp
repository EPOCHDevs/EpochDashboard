#include <catch2/catch_test_macros.hpp>
#include <catch2/matchers/catch_matchers_string.hpp>
#include <catch2/matchers/catch_matchers_floating_point.hpp>
#include "epoch_dashboard/tearsheet/tearsheet_builder.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include "epoch_dashboard/tearsheet/series_converter.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"

#include <epoch_frame/scalar.h>
#include <epoch_frame/series.h>
#include <epoch_frame/dataframe.h>

using namespace epoch_tearsheet;
using namespace epoch_frame;
using Catch::Matchers::WithinAbs;

TEST_CASE("TearsheetBuilder Basic Operations", "[tearsheet][builder]") {

    SECTION("Create empty builder") {
        auto builder = TearsheetBuilder::create();
        auto result = builder.build();

        REQUIRE(result.isSuccess());

        auto tearsheet = result.value();
        // Empty tearsheet should have no components
        REQUIRE_FALSE(tearsheet.has_cards());
        REQUIRE_FALSE(tearsheet.has_charts());
        REQUIRE_FALSE(tearsheet.has_tables());
    }

    SECTION("From scalar double") {
        Scalar scalar(42.5);
        auto builder = TearsheetBuilder::fromScalar(scalar);

        auto result = builder.toProtoScalar();
        REQUIRE(result.isSuccess());

        auto protoScalar = result.value();
        REQUIRE(protoScalar.has_decimal_value());
        REQUIRE_THAT(protoScalar.decimal_value(), WithinAbs(42.5, 0.001));
    }

    SECTION("From scalar int") {
        Scalar scalar(int64_t(100));
        auto builder = TearsheetBuilder::fromScalar(scalar);

        auto result = builder.toProtoScalar();
        REQUIRE(result.isSuccess());

        auto protoScalar = result.value();
        REQUIRE(protoScalar.has_integer_value());
        REQUIRE(protoScalar.integer_value() == 100);
    }

    SECTION("From scalar string") {
        Scalar scalar(std::string("test"));
        auto builder = TearsheetBuilder::fromScalar(scalar);

        auto result = builder.toProtoScalar();
        REQUIRE(result.isSuccess());

        auto protoScalar = result.value();
        REQUIRE(protoScalar.has_string_value());
        REQUIRE(protoScalar.string_value() == "test");
    }
}

TEST_CASE("TearsheetBuilder Card Operations", "[tearsheet][cards]") {

    SECTION("Add card to builder") {
        auto builder = TearsheetBuilder::create();
        Scalar value(123.45);

        CardConfig config;
        config.title = "Test Card";
        config.subtitle = "Subtitle";

        builder.addCard("Total Return", value, config);

        auto result = builder.build();
        REQUIRE(result.isSuccess());

        auto tearsheet = result.value();
        REQUIRE(tearsheet.has_cards());
        REQUIRE(tearsheet.cards().cards_size() == 1);

        const auto& card = tearsheet.cards().cards(0);
        REQUIRE(card.title() == "Total Return");
        REQUIRE(card.fields_size() > 0);
    }
}

TEST_CASE("TearsheetBuilder Full Tearsheet", "[tearsheet][full]") {

    SECTION("Build full tearsheet") {
        auto builder = TearsheetBuilder::create();

        Scalar value1(100.0);
        Scalar value2(200.0);

        builder.withCategory("Performance")
               .addCard("Metric 1", value1)
               .addCard("Metric 2", value2);

        auto result = builder.buildFull();
        REQUIRE(result.isSuccess());

        auto fullTearsheet = result.value();
        REQUIRE(fullTearsheet.categories_size() == 1);
        REQUIRE(fullTearsheet.categories().contains("Performance"));

        const auto& tearsheet = fullTearsheet.categories().at("Performance");
        REQUIRE(tearsheet.has_cards());
        REQUIRE(tearsheet.cards().cards_size() == 2);
    }
}

TEST_CASE("TearSheetAssembler Operations", "[tearsheet][assembler]") {

    SECTION("Basic assembly") {
        TearSheetAssembler assembler("TestCategory");

        Scalar value(42.0);
        assembler.addCard("Test Card", value);

        auto tearsheet = assembler.build();
        REQUIRE(tearsheet.has_cards());
        REQUIRE(tearsheet.cards().cards_size() == 1);
    }

    SECTION("Multiple categories") {
        TearSheetAssembler performanceAssembler("Performance");
        TearSheetAssembler riskAssembler("Risk");

        Scalar returnValue(15.5);
        Scalar volatilityValue(0.25);

        performanceAssembler.addCard("Annual Return", returnValue);
        riskAssembler.addCard("Volatility", volatilityValue);

        auto fullTearsheet = TearSheetAssembler::buildFullTearSheet({
            {"Performance", performanceAssembler},
            {"Risk", riskAssembler}
        });

        REQUIRE(fullTearsheet.categories_size() == 2);
        REQUIRE(fullTearsheet.categories().contains("Performance"));
        REQUIRE(fullTearsheet.categories().contains("Risk"));
    }
}

TEST_CASE("TearsheetBuilder Error Handling", "[tearsheet][error]") {

    SECTION("Conversion error handling") {
        auto builder = TearsheetBuilder::create();

        // Try to convert empty builder to scalar
        auto result = builder.toProtoScalar();
        REQUIRE(result.isError());
        REQUIRE_FALSE(result.error().empty());
    }
}

TEST_CASE("TearsheetBuilder Fluent API", "[tearsheet][fluent]") {

    SECTION("Fluent API chaining") {
        Scalar value1(100.0);
        Scalar value2(200.0);
        Scalar value3(300.0);

        auto builder = std::move(TearsheetBuilder::create()
            .withTitle("Test Tearsheet")
            .withCategory("Metrics")
            .addCard("Card 1", value1)
            .addCard("Card 2", value2)
            .addCard("Card 3", value3));

        auto result = builder.build();
        REQUIRE(result.isSuccess());

        auto tearsheet = result.value();
        REQUIRE(tearsheet.has_cards());
        REQUIRE(tearsheet.cards().cards_size() == 3);
    }
}

TEST_CASE("Result Class", "[tearsheet][result]") {

    SECTION("Result success") {
        Result<int> result(42);
        REQUIRE(result.isSuccess());
        REQUIRE_FALSE(result.isError());
        REQUIRE(result.value() == 42);
    }

    SECTION("Result error") {
        Result<int> result("Error message");
        REQUIRE_FALSE(result.isSuccess());
        REQUIRE(result.isError());
        REQUIRE(result.error() == "Error message");
    }
}