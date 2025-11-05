#include "epoch_dashboard/tearsheet/tearsheet_builder.h"

namespace epoch_tearsheet {

DashboardBuilder& DashboardBuilder::setCategory(const std::string& category) {
    category_ = category;
    return *this;
}

DashboardBuilder& DashboardBuilder::addCard(const epoch_proto::CardDef& card) {
    // Copy into the calling thread's local bucket to avoid contention.
    cards_tls_.local().push_back(card);
    return *this;
}

DashboardBuilder& DashboardBuilder::addChart(const epoch_proto::Chart& chart) {
    charts_tls_.local().push_back(chart);
    return *this;
}

DashboardBuilder& DashboardBuilder::addTable(const epoch_proto::Table& table) {
    tables_tls_.local().push_back(table);
    return *this;
}

epoch_proto::TearSheet DashboardBuilder::build() const {
    epoch_proto::TearSheet tearsheet;

    // Merge thread-local buckets serially into the final TearSheet.
    // Repeated builds remain cumulative: we do not consume/clear buckets here.

    // Cards
    size_t total_cards = 0;
    for (const auto& bucket : cards_tls_) total_cards += bucket.size();
    if (total_cards > 0) {
        auto* card_list = tearsheet.mutable_cards();
        card_list->mutable_cards()->Reserve(static_cast<int>(total_cards));
        for (const auto& bucket : cards_tls_) {
            for (const auto& card : bucket) {
                auto* dst = card_list->add_cards();
                dst->CopyFrom(card);
            }
        }
    }

    // Charts
    size_t total_charts = 0;
    for (const auto& bucket : charts_tls_) total_charts += bucket.size();
    if (total_charts > 0) {
        auto* chart_list = tearsheet.mutable_charts();
        chart_list->mutable_charts()->Reserve(static_cast<int>(total_charts));
        for (const auto& bucket : charts_tls_) {
            for (const auto& chart : bucket) {
                auto* dst = chart_list->add_charts();
                dst->CopyFrom(chart);
            }
        }
    }

    // Tables
    size_t total_tables = 0;
    for (const auto& bucket : tables_tls_) total_tables += bucket.size();
    if (total_tables > 0) {
        auto* table_list = tearsheet.mutable_tables();
        table_list->mutable_tables()->Reserve(static_cast<int>(total_tables));
        for (const auto& bucket : tables_tls_) {
            for (const auto& table : bucket) {
                auto* dst = table_list->add_tables();
                dst->CopyFrom(table);
            }
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
