#include "epoch_dashboard/tearsheet/table_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"

namespace epoch_tearsheet {

TableBuilder& TableBuilder::setType(epoch_proto::EpochFolioDashboardWidget type) {
    table_.set_type(type);
    return *this;
}

TableBuilder& TableBuilder::setCategory(const std::string& category) {
    table_.set_category(category);
    return *this;
}

TableBuilder& TableBuilder::setTitle(const std::string& title) {
    table_.set_title(title);
    return *this;
}

TableBuilder& TableBuilder::addColumn(const epoch_proto::ColumnDef& col) {
    *table_.add_columns() = col;
    return *this;
}

TableBuilder& TableBuilder::addColumn(const std::string& id, const std::string& name, epoch_proto::EpochFolioType type) {
    auto* col = table_.add_columns();
    col->set_id(id);
    col->set_name(name);
    col->set_type(type);
    return *this;
}

TableBuilder& TableBuilder::addColumns(const std::vector<epoch_proto::ColumnDef>& cols) {
    for (const auto& col : cols) {
        *table_.add_columns() = col;
    }
    return *this;
}

TableBuilder& TableBuilder::addRow(const epoch_proto::TableRow& row) {
    *table_.mutable_data()->add_rows() = row;
    return *this;
}

TableBuilder& TableBuilder::addRows(const std::vector<epoch_proto::TableRow>& rows) {
    for (const auto& row : rows) {
        *table_.mutable_data()->add_rows() = row;
    }
    return *this;
}

TableBuilder& TableBuilder::fromDataFrame(const epoch_frame::DataFrame& df,
                                          const std::vector<std::string>& columns) {
    if (columns.empty()) {
        addColumns(DataFrameFactory::toColumnDefs(df));
        addRows(DataFrameFactory::toTableRows(df));
    } else {
        for (const auto& col_name : columns) {
            addColumn(DataFrameFactory::toColumnDef(df, col_name));
        }
        addRows(DataFrameFactory::toTableRows(df, columns));
    }

    return *this;
}

epoch_proto::Table TableBuilder::build() const {
    return table_;
}

} // namespace epoch_tearsheet