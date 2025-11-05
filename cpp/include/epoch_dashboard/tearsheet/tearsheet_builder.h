#pragma once

#include <string>
#include <vector>
#include <map>

#include <tbb/enumerable_thread_specific.h>

#include "epoch_protos/tearsheet.pb.h"

namespace epoch_tearsheet {

class DashboardBuilder {
public:
    DashboardBuilder& setCategory(const std::string& category);
    DashboardBuilder& addCard(const epoch_proto::CardDef& card);
    DashboardBuilder& addChart(const epoch_proto::Chart& chart);
    DashboardBuilder& addTable(const epoch_proto::Table& table);

    epoch_proto::TearSheet build() const;

private:
    std::string category_;
    // Thread-local buckets for concurrent add* calls from worker threads.
    // Kept mutable to allow merging in build() while preserving const API.
    mutable tbb::enumerable_thread_specific<std::vector<epoch_proto::CardDef>> cards_tls_;
    mutable tbb::enumerable_thread_specific<std::vector<epoch_proto::Chart>> charts_tls_;
    mutable tbb::enumerable_thread_specific<std::vector<epoch_proto::Table>> tables_tls_;
};

class FullDashboardBuilder {
public:
    FullDashboardBuilder& addCategory(const std::string& category, const epoch_proto::TearSheet& dashboard);
    FullDashboardBuilder& addCategoryBuilder(const std::string& category, const DashboardBuilder& builder);

    epoch_proto::FullTearSheet build() const;

private:
    std::map<std::string, epoch_proto::TearSheet> categories_;
};

} // namespace epoch_tearsheet
