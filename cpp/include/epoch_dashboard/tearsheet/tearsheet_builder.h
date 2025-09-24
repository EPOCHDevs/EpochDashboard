#pragma once

#include <string>
#include <vector>
#include <map>

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
    std::vector<epoch_proto::CardDef> cards_;
    std::vector<epoch_proto::Chart> charts_;
    std::vector<epoch_proto::Table> tables_;
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