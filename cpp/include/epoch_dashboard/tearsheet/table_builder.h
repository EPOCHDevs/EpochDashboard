#pragma once

#include <string>
#include <vector>

#include "epoch_protos/table_def.pb.h"

namespace epoch_frame {
    class DataFrame;
}

namespace epoch_tearsheet {

class TableBuilder {
public:
    TableBuilder& setType(epoch_proto::EpochFolioDashboardWidget type);
    TableBuilder& setCategory(const std::string& category);
    TableBuilder& setTitle(const std::string& title);
    TableBuilder& addColumn(const epoch_proto::ColumnDef& col);
    TableBuilder& addColumn(const std::string& id, const std::string& name, epoch_proto::EpochFolioType type);
    TableBuilder& addColumns(const std::vector<epoch_proto::ColumnDef>& cols);
    TableBuilder& addRow(const epoch_proto::TableRow& row);
    TableBuilder& addRows(const std::vector<epoch_proto::TableRow>& rows);
    TableBuilder& fromDataFrame(const epoch_frame::DataFrame& df,
                                const std::vector<std::string>& columns = {});

    epoch_proto::Table build() const;

private:
    epoch_proto::Table table_;
};

} // namespace epoch_tearsheet