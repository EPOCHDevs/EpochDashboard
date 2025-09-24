#include "epoch_dashboard/tearsheet/tearsheet_builder.h"

namespace epoch_tearsheet {

DashboardBuilder& DashboardBuilder::setCategory(const std::string& category) {
    category_ = category;
    return *this;
}

DashboardBuilder& DashboardBuilder::addCard(const epoch_proto::CardDef& card) {
    cards_.push_back(card);
    return *this;
}

DashboardBuilder& DashboardBuilder::addChart(const epoch_proto::Chart& chart) {
    charts_.push_back(chart);
    return *this;
}

DashboardBuilder& DashboardBuilder::addTable(const epoch_proto::Table& table) {
    tables_.push_back(table);
    return *this;
}

epoch_proto::TearSheet DashboardBuilder::build() const {
    epoch_proto::TearSheet tearsheet;

    if (!cards_.empty()) {
        auto* card_list = tearsheet.mutable_cards();
        for (const auto& card : cards_) {
            *card_list->add_cards() = card;
        }
    }

    if (!charts_.empty()) {
        auto* chart_list = tearsheet.mutable_charts();
        for (const auto& chart : charts_) {
            *chart_list->add_charts() = chart;
        }
    }

    if (!tables_.empty()) {
        auto* table_list = tearsheet.mutable_tables();
        for (const auto& table : tables_) {
            *table_list->add_tables() = table;
        }
    }

    return tearsheet;
}

FullDashboardBuilder& FullDashboardBuilder::addCategory(const std::string& category,
                                                         const epoch_proto::TearSheet& dashboard) {
    categories_[category] = dashboard;
    return *this;
}

FullDashboardBuilder& FullDashboardBuilder::addCategoryBuilder(const std::string& category,
                                                                const DashboardBuilder& builder) {
    categories_[category] = builder.build();
    return *this;
}

epoch_proto::FullTearSheet FullDashboardBuilder::build() const {
    epoch_proto::FullTearSheet full_tearsheet;

    for (const auto& [category, tearsheet] : categories_) {
        (*full_tearsheet.mutable_categories())[category] = tearsheet;
    }

    return full_tearsheet;
}

} // namespace epoch_tearsheet