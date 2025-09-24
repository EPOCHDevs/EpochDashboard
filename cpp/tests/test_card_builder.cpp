#include <catch2/catch_test_macros.hpp>
#include "epoch_dashboard/tearsheet/card_builder.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"

using namespace epoch_tearsheet;

TEST_CASE("CardDataBuilder: Basic construction", "[card]") {
    auto card_data = CardDataBuilder()
        .setTitle("Total Return")
        .setValue(ScalarFactory::fromDecimal(0.15))
        .setType(epoch_proto::TypePercent)
        .setGroup(0)
        .build();

    REQUIRE(card_data.title() == "Total Return");
    REQUIRE(card_data.value().decimal_value() == 0.15);
    REQUIRE(card_data.type() == epoch_proto::TypePercent);
    REQUIRE(card_data.group() == 0);
}

TEST_CASE("CardDataBuilder: Different scalar types", "[card]") {
    auto monetary = CardDataBuilder()
        .setTitle("Portfolio Value")
        .setValue(ScalarFactory::fromDecimal(1000000.0))
        .setType(epoch_proto::TypeMonetary)
        .build();

    REQUIRE(monetary.type() == epoch_proto::TypeMonetary);
    REQUIRE(monetary.value().decimal_value() == 1000000.0);

    auto integer = CardDataBuilder()
        .setTitle("Trade Count")
        .setValue(ScalarFactory::fromInteger(150))
        .setType(epoch_proto::TypeInteger)
        .build();

    REQUIRE(integer.type() == epoch_proto::TypeInteger);
    REQUIRE(integer.value().integer_value() == 150);
}

TEST_CASE("CardBuilder: Basic card construction", "[card]") {
    auto card = CardBuilder()
        .setType(epoch_proto::WidgetCard)
        .setCategory("Performance Metrics")
        .setGroupSize(3)
        .build();

    REQUIRE(card.type() == epoch_proto::WidgetCard);
    REQUIRE(card.category() == "Performance Metrics");
    REQUIRE(card.group_size() == 3);
}

TEST_CASE("CardBuilder: Add card data", "[card]") {
    auto data1 = CardDataBuilder()
        .setTitle("Return")
        .setValue(ScalarFactory::fromDecimal(0.10))
        .setType(epoch_proto::TypePercent)
        .setGroup(0)
        .build();

    auto data2 = CardDataBuilder()
        .setTitle("Sharpe")
        .setValue(ScalarFactory::fromDecimal(1.5))
        .setType(epoch_proto::TypeDecimal)
        .setGroup(0)
        .build();

    auto card = CardBuilder()
        .setType(epoch_proto::WidgetCard)
        .setCategory("Metrics")
        .addCardData(data1)
        .addCardData(data2)
        .setGroupSize(2)
        .build();

    REQUIRE(card.data_size() == 2);
    REQUIRE(card.data(0).title() == "Return");
    REQUIRE(card.data(1).title() == "Sharpe");
    REQUIRE(card.group_size() == 2);
}

TEST_CASE("CardBuilder: Multiple groups", "[card]") {
    auto g0_d1 = CardDataBuilder()
        .setTitle("Annual Return")
        .setValue(ScalarFactory::fromDecimal(0.12))
        .setType(epoch_proto::TypePercent)
        .setGroup(0)
        .build();

    auto g0_d2 = CardDataBuilder()
        .setTitle("Annual Volatility")
        .setValue(ScalarFactory::fromDecimal(0.18))
        .setType(epoch_proto::TypePercent)
        .setGroup(0)
        .build();

    auto g1_d1 = CardDataBuilder()
        .setTitle("Max Drawdown")
        .setValue(ScalarFactory::fromDecimal(-0.25))
        .setType(epoch_proto::TypePercent)
        .setGroup(1)
        .build();

    auto card = CardBuilder()
        .setType(epoch_proto::WidgetCard)
        .setCategory("Risk Metrics")
        .addCardData(g0_d1)
        .addCardData(g0_d2)
        .addCardData(g1_d1)
        .setGroupSize(2)
        .build();

    REQUIRE(card.data_size() == 3);
    REQUIRE(card.data(0).group() == 0);
    REQUIRE(card.data(1).group() == 0);
    REQUIRE(card.data(2).group() == 1);
    REQUIRE(card.group_size() == 2);
}

TEST_CASE("CardBuilder: String values", "[card]") {
    auto card_data = CardDataBuilder()
        .setTitle("Strategy Name")
        .setValue(ScalarFactory::fromString("Momentum Strategy"))
        .setType(epoch_proto::TypeString)
        .build();

    REQUIRE(card_data.value().string_value() == "Momentum Strategy");
    REQUIRE(card_data.type() == epoch_proto::TypeString);
}