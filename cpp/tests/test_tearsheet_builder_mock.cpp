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

TEST_CASE("TearsheetBuilder with Real EpochFrame Types", "[tearsheet][epochframe]") {

    SECTION("Real Series operations") {
        std::vector<double> test_values = {1.0, 2.0, 3.0, 4.0, 5.0};
        // Create a simple series with test values
        // Note: Actual Series construction will depend on epoch_frame API
        Series series; // TODO: Use proper Series constructor when available

        // Test that the real series works as expected
        // These tests will be properly implemented once Series API is available
        // REQUIRE(series.size() == 5);
        // REQUIRE_FALSE(series.empty());
    }

    SECTION("Real DataFrame operations") {
        // Create a simple DataFrame with some test data
        // Note: Actual DataFrame construction will depend on epoch_frame API
        DataFrame df; // TODO: Use proper DataFrame constructor when available

        // These tests will be properly implemented once DataFrame API is available
        // REQUIRE(df.numRows() == 3);
        // REQUIRE(df.numColumns() == 3);
    }
}

// Tests using simple implementations (not mocks)
TEST_CASE("TearsheetBuilder Basic Operations", "[tearsheet][builder]") {

    SECTION("Create empty builder") {
        auto builder = TearsheetBuilder::create();
        auto result = builder.build();

        REQUIRE(result.isSuccess());

        auto tearsheet = result.value();
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
        REQUIRE(protoScalar.has_double_value());
        REQUIRE_THAT(protoScalar.double_value(), WithinAbs(42.5, 0.001));
    }

    SECTION("From scalar int") {
        Scalar scalar(int64_t(100));
        auto builder = TearsheetBuilder::fromScalar(scalar);

        auto result = builder.toProtoScalar();
        REQUIRE(result.isSuccess());

        auto protoScalar = result.value();
        REQUIRE(protoScalar.has_int64_value());
        REQUIRE(protoScalar.int64_value() == 100);
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
        REQUIRE(card.category() == "Default");
        REQUIRE(card.data_size() > 0);
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