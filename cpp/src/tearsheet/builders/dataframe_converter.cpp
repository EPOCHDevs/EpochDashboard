#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include <epoch_frame/dataframe.h>
#include <epoch_frame/index.h>
#include <arrow/api.h>

namespace epoch_tearsheet {

std::vector<epoch_proto::ColumnDef> DataFrameFactory::toColumnDefs(const epoch_frame::DataFrame& df) {
    std::vector<epoch_proto::ColumnDef> columns;

    auto arrow_table = df.table();
    auto schema = arrow_table->schema();

    for (int i = 0; i < schema->num_fields(); ++i) {
        auto field = schema->field(i);
        columns.push_back(toColumnDef(df, field->name()));
    }

    return columns;
}

epoch_proto::ColumnDef DataFrameFactory::toColumnDef(const epoch_frame::DataFrame& df,
                                                     const std::string& column_name) {
    epoch_proto::ColumnDef col;
    col.set_id(column_name);
    col.set_name(column_name);
    col.set_type(inferColumnType(df, column_name));
    return col;
}

epoch_proto::ColumnDef DataFrameFactory::toColumnDef([[maybe_unused]] const epoch_frame::DataFrame& df,
                                                     const std::string& column_name,
                                                     const std::string& display_name,
                                                     epoch_proto::EpochFolioType type) {
    epoch_proto::ColumnDef col;
    col.set_id(column_name);
    col.set_name(display_name);
    col.set_type(type);
    return col;
}

std::vector<epoch_proto::TableRow> DataFrameFactory::toTableRows(const epoch_frame::DataFrame& df) {
    std::vector<epoch_proto::TableRow> rows;

    auto arrow_table = df.table();
    rows.reserve(arrow_table->num_rows());

    for (int64_t i = 0; i < arrow_table->num_rows(); ++i) {
        rows.push_back(toTableRow(df, i));
    }

    return rows;
}

std::vector<epoch_proto::TableRow> DataFrameFactory::toTableRows(const epoch_frame::DataFrame& df,
                                                                  const std::vector<std::string>& columns) {
    std::vector<epoch_proto::TableRow> rows;

    auto arrow_table = df.table();
    rows.reserve(arrow_table->num_rows());

    for (int64_t i = 0; i < arrow_table->num_rows(); ++i) {
        rows.push_back(toTableRow(df, i, columns));
    }

    return rows;
}

epoch_proto::TableRow DataFrameFactory::toTableRow(const epoch_frame::DataFrame& df, uint64_t row_index) {
    epoch_proto::TableRow row;

    auto arrow_table = df.table();

    for (int col_idx = 0; col_idx < arrow_table->num_columns(); ++col_idx) {
        auto column = arrow_table->column(col_idx);
        auto scalar_result = column->GetScalar(row_index);

        if (scalar_result.ok()) {
            auto arrow_scalar = scalar_result.ValueOrDie();
            epoch_frame::Scalar ef_scalar(arrow_scalar);
            *row.add_values() = ScalarFactory::create(ef_scalar);
        } else {
            row.add_values()->set_null_value(epoch_proto::NULL_VALUE);
        }
    }

    return row;
}

epoch_proto::TableRow DataFrameFactory::toTableRow(const epoch_frame::DataFrame& df, uint64_t row_index,
                                                    const std::vector<std::string>& columns) {
    epoch_proto::TableRow row;

    auto arrow_table = df.table();

    for (const auto& col_name : columns) {
        auto column = arrow_table->GetColumnByName(col_name);
        if (!column) {
            row.add_values()->set_null_value(epoch_proto::NULL_VALUE);
            continue;
        }

        auto scalar_result = column->GetScalar(row_index);

        if (scalar_result.ok()) {
            auto arrow_scalar = scalar_result.ValueOrDie();
            epoch_frame::Scalar ef_scalar(arrow_scalar);
            *row.add_values() = ScalarFactory::create(ef_scalar);
        } else {
            row.add_values()->set_null_value(epoch_proto::NULL_VALUE);
        }
    }

    return row;
}

epoch_proto::Line DataFrameFactory::toLine(const epoch_frame::DataFrame& df,
                                           const std::string& x_column,
                                           const std::string& y_column,
                                           const std::string& name) {
    epoch_proto::Line line;
    line.set_name(name.empty() ? y_column : name);

    auto arrow_table = df.table();
    auto x_col = arrow_table->GetColumnByName(x_column);
    auto y_col = arrow_table->GetColumnByName(y_column);

    if (!x_col || !y_col) {
        return line;
    }

    for (int64_t i = 0; i < std::min(x_col->length(), y_col->length()); ++i) {
        auto x_result = x_col->GetScalar(i);
        auto y_result = y_col->GetScalar(i);

        if (x_result.ok() && y_result.ok()) {
            auto x_scalar = x_result.ValueOrDie();
            auto y_scalar = y_result.ValueOrDie();

            if (x_scalar->is_valid && y_scalar->is_valid) {
                auto* point = line.add_data();
                point->set_x(static_cast<int64_t>(std::static_pointer_cast<arrow::DoubleScalar>(x_scalar)->value));
                point->set_y(std::static_pointer_cast<arrow::DoubleScalar>(y_scalar)->value);
            }
        }
    }

    return line;
}

std::vector<epoch_proto::Line> DataFrameFactory::toLines(const epoch_frame::DataFrame& df,
                                                          const std::string& x_column,
                                                          const std::vector<std::string>& y_columns) {
    std::vector<epoch_proto::Line> lines;
    lines.reserve(y_columns.size());

    for (const auto& y_col : y_columns) {
        lines.push_back(toLine(df, x_column, y_col, y_col));
    }

    return lines;
}

epoch_proto::Array DataFrameFactory::toArray(const epoch_frame::DataFrame& df,
                                             const std::string& column_name) {
    epoch_proto::Array array;

    auto arrow_table = df.table();
    auto column = arrow_table->GetColumnByName(column_name);

    if (!column) {
        return array;
    }

    for (int64_t i = 0; i < column->length(); ++i) {
        auto scalar_result = column->GetScalar(i);

        if (scalar_result.ok()) {
            auto arrow_scalar = scalar_result.ValueOrDie();
            epoch_frame::Scalar ef_scalar(arrow_scalar);
            *array.add_values() = ScalarFactory::create(ef_scalar);
        } else {
            array.add_values()->set_null_value(epoch_proto::NULL_VALUE);
        }
    }

    return array;
}

std::vector<std::string> DataFrameFactory::getNumericColumns(const epoch_frame::DataFrame& df) {
    std::vector<std::string> numeric_cols;

    auto arrow_table = df.table();
    auto schema = arrow_table->schema();

    for (int i = 0; i < schema->num_fields(); ++i) {
        auto field = schema->field(i);
        auto type_id = field->type()->id();

        if (type_id == arrow::Type::DOUBLE || type_id == arrow::Type::FLOAT ||
            type_id == arrow::Type::INT64 || type_id == arrow::Type::INT32 ||
            type_id == arrow::Type::UINT64 || type_id == arrow::Type::UINT32) {
            numeric_cols.push_back(field->name());
        }
    }

    return numeric_cols;
}

std::vector<std::string> DataFrameFactory::getColumnNames(const epoch_frame::DataFrame& df) {
    std::vector<std::string> column_names;

    auto arrow_table = df.table();
    auto schema = arrow_table->schema();

    for (int i = 0; i < schema->num_fields(); ++i) {
        column_names.push_back(schema->field(i)->name());
    }

    return column_names;
}

epoch_proto::EpochFolioType DataFrameFactory::inferColumnType(const epoch_frame::DataFrame& df,
                                                              const std::string& column_name) {
    auto arrow_table = df.table();
    auto field = arrow_table->schema()->GetFieldByName(column_name);

    if (!field) {
        return epoch_proto::TypeString;
    }

    auto type_id = field->type()->id();

    switch (type_id) {
        case arrow::Type::DOUBLE:
        case arrow::Type::FLOAT:
            return epoch_proto::TypeDecimal;
        case arrow::Type::INT64:
        case arrow::Type::INT32:
        case arrow::Type::UINT64:
        case arrow::Type::UINT32:
            return epoch_proto::TypeInteger;
        case arrow::Type::STRING:
        case arrow::Type::LARGE_STRING:
            return epoch_proto::TypeString;
        case arrow::Type::TIMESTAMP:
            return epoch_proto::TypeDateTime;
        case arrow::Type::DATE32:
        case arrow::Type::DATE64:
            return epoch_proto::TypeDate;
        case arrow::Type::BOOL:
            return epoch_proto::TypeBoolean;
        default:
            return epoch_proto::TypeString;
    }
}

int64_t DataFrameFactory::toMilliseconds(int64_t timestamp_value, arrow::TimeUnit::type unit) {
    switch (unit) {
        case arrow::TimeUnit::NANO:
            return timestamp_value / 1000000;
        case arrow::TimeUnit::MICRO:
            return timestamp_value / 1000;
        case arrow::TimeUnit::MILLI:
            return timestamp_value;
        case arrow::TimeUnit::SECOND:
            return timestamp_value * 1000;
        default:
            // Default to nanoseconds for unknown units
            return timestamp_value / 1000000;
    }
}

} // namespace epoch_tearsheet