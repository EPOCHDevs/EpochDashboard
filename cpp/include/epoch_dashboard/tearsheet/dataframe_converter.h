#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"
#include "epoch_protos/table_def.pb.h"
#include "epoch_protos/common.pb.h"
#include <arrow/api.h>

namespace epoch_frame {
    class DataFrame;
}

namespace epoch_tearsheet {

class DataFrameFactory {
public:
    static std::vector<epoch_proto::ColumnDef> toColumnDefs(const epoch_frame::DataFrame& df);

    static epoch_proto::ColumnDef toColumnDef(const epoch_frame::DataFrame& df,
                                             const std::string& column_name);

    static epoch_proto::ColumnDef toColumnDef(const epoch_frame::DataFrame& df,
                                             const std::string& column_name,
                                             const std::string& display_name,
                                             epoch_proto::EpochFolioType type);

    static std::vector<epoch_proto::TableRow> toTableRows(const epoch_frame::DataFrame& df);

    static std::vector<epoch_proto::TableRow> toTableRows(const epoch_frame::DataFrame& df,
                                                          const std::vector<std::string>& columns);

    static epoch_proto::TableRow toTableRow(const epoch_frame::DataFrame& df, uint64_t row_index);

    static epoch_proto::TableRow toTableRow(const epoch_frame::DataFrame& df, uint64_t row_index,
                                            const std::vector<std::string>& columns);

    static epoch_proto::Line toLine(const epoch_frame::DataFrame& df,
                                   const std::string& x_column,
                                   const std::string& y_column,
                                   const std::string& name = "");

    static std::vector<epoch_proto::Line> toLines(const epoch_frame::DataFrame& df,
                                                  const std::string& x_column,
                                                  const std::vector<std::string>& y_columns);

    static epoch_proto::Array toArray(const epoch_frame::DataFrame& df,
                                     const std::string& column_name);

    static std::vector<std::string> getNumericColumns(const epoch_frame::DataFrame& df);

    static std::vector<std::string> getColumnNames(const epoch_frame::DataFrame& df);

    static epoch_proto::EpochFolioType inferColumnType(const epoch_frame::DataFrame& df,
                                                       const std::string& column_name);

    static int64_t toMilliseconds(int64_t timestamp_value, arrow::TimeUnit::type unit);

    static int64_t toInt64Index(int64_t index_value);
};

} // namespace epoch_tearsheet