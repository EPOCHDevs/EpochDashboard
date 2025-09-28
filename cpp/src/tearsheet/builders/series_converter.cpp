#include "epoch_dashboard/tearsheet/series_converter.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include <epoch_frame/series.h>
#include <epoch_frame/index.h>
#include <arrow/api.h>

namespace epoch_tearsheet {

epoch_proto::Array SeriesFactory::toArray(const epoch_frame::Series& series) {
    epoch_proto::Array array;

    for (uint64_t i = 0; i < series.size(); ++i) {
        auto scalar = series.iloc(i);
        *array.add_values() = ScalarFactory::create(scalar);
    }

    return array;
}

    epoch_proto::Point toPointFromTimestamp(const std::shared_ptr<arrow::TimestampArray>& indexArr,
arrow::TimeUnit::type const& time_unit,
const std::shared_ptr<arrow::DoubleArray>& arr,
                                          uint64_t index) {
    epoch_proto::Point point;

    int64_t timestamp_value = indexArr->Value(index);
    point.set_x(DataFrameFactory::toMilliseconds(timestamp_value, time_unit));
    point.set_y(arr->Value(index));
    return point;
}

epoch_proto::Point toPointFromInt64(const std::shared_ptr<arrow::Int64Array>& indexArr,
const std::shared_ptr<arrow::DoubleArray>& arr,
                                          uint64_t index) {
    epoch_proto::Point point;

    int64_t index_value = indexArr->Value(index);
    point.set_x(DataFrameFactory::toInt64Index(index_value));
    point.set_y(arr->Value(index));
    return point;
}

epoch_proto::Point toPointFromUint64(const std::shared_ptr<arrow::UInt64Array>& indexArr,
const std::shared_ptr<arrow::DoubleArray>& arr,
                                           uint64_t index) {
    epoch_proto::Point point;

    uint64_t index_value = indexArr->Value(index);
    point.set_x(DataFrameFactory::toInt64Index(static_cast<int64_t>(index_value)));
    point.set_y(arr->Value(index));
    return point;
}


epoch_proto::Line SeriesFactory::toLine(const epoch_frame::Series& series,
                                        const std::string& name,
                                        const LineStyle& style) {
    epoch_proto::Line line;
    line.set_name(name.empty() ? series.name().value_or("line") : name);

    if (style.dash_style.has_value()) {
        line.set_dash_style(style.dash_style.value());
    }
    if (style.line_width.has_value()) {
        line.set_line_width(style.line_width.value());
    }

    auto index = series.index();
    const auto arr = series.contiguous_array().to_view<double>();

    // Check if the index is a timestamp or int64
    auto index_array = index->array();
    auto index_type = index_array->type();


    if (index_type->id() == arrow::Type::TIMESTAMP) {
        const auto timestamp_array = index->array().to_timestamp_view();
        const auto timestamp_type = std::static_pointer_cast<arrow::TimestampType>(timestamp_array->type());
        const auto time_unit = timestamp_type->unit();

        for (uint64_t i = 0; i < series.size(); ++i) {
            *line.add_data() = toPointFromTimestamp(timestamp_array, time_unit, arr, i);
        }
    } else if (index_type->id() == arrow::Type::INT64 || index_type->id() == arrow::Type::UINT64) {
        if (index_type->id() == arrow::Type::INT64) {
            const auto int64_view = index_array.to_view<int64_t>();
            for (uint64_t i = 0; i < series.size(); ++i) {
                epoch_proto::Point point;
                point.set_x(DataFrameFactory::toInt64Index(int64_view->Value(i)));
                point.set_y(arr->Value(i));
                *line.add_data() = point;
            }
        } else {
            const auto uint64_view = index_array.to_view<uint64_t>();
            for (uint64_t i = 0; i < series.size(); ++i) {
                epoch_proto::Point point;
                point.set_x(DataFrameFactory::toInt64Index(static_cast<int64_t>(uint64_view->Value(i))));
                point.set_y(arr->Value(i));
                *line.add_data() = point;
            }
        }
    } else {
        throw std::runtime_error("Index must be either timestamp or numeric (int64/uint64) type for line conversion");
    }

    return line;
}

std::vector<epoch_proto::Point> SeriesFactory::toPoints(const epoch_frame::Series& y_series) {
    std::vector<epoch_proto::Point> points;
    uint64_t size = y_series.size();
    points.reserve(size);

    auto index = y_series.index();
    auto index_array = index->array();
    auto index_type = index_array->type();

    // Debug: Print the type for debugging
    // std::cout << "toPoints Index type: " << index_type->ToString() << " (id: " << static_cast<int>(index_type->id()) << ")" << std::endl;

    auto arr = y_series.contiguous_array().to_view<double>();

    if (index_type->id() == arrow::Type::TIMESTAMP) {
        auto timestamp_array = index->array().to_timestamp_view();
        auto timestamp_type = std::static_pointer_cast<arrow::TimestampType>(timestamp_array->type());
        auto time_unit = timestamp_type->unit();

        for (uint64_t i = 0; i < size; ++i) {
            points.push_back(toPointFromTimestamp(timestamp_array, time_unit, arr, i));
        }
    } else if (index_type->id() == arrow::Type::INT64 || index_type->id() == arrow::Type::UINT64) {
        if (index_type->id() == arrow::Type::INT64) {
            const auto int64_array = std::static_pointer_cast<arrow::Int64Array>(index->array().to_view<int64_t>());
            for (uint64_t i = 0; i < size; ++i) {
                points.push_back(toPointFromInt64(int64_array, arr, i));
            }
        } else {
            const auto uint64_array = std::static_pointer_cast<arrow::UInt64Array>(index->array().to_view<size_t>());
            for (uint64_t i = 0; i < size; ++i) {
                points.push_back(toPointFromUint64(uint64_array, arr, i));
            }
        }
    } else {
        throw std::runtime_error("Index must be either timestamp or numeric (int64/uint64) type for point conversion");
    }

    return points;
}

epoch_proto::TableRow SeriesFactory::toTableRow(const epoch_frame::Series& series, uint64_t index) {
    epoch_proto::TableRow row;
    *row.add_values() = ScalarFactory::create(series.iloc(index));
    return row;
}

std::vector<epoch_proto::TableRow> SeriesFactory::toTableRows(const epoch_frame::Series& series) {
    std::vector<epoch_proto::TableRow> rows;
    rows.reserve(series.size());

    for (uint64_t i = 0; i < series.size(); ++i) {
        rows.push_back(toTableRow(series, i));
    }

    return rows;
}

} // namespace epoch_tearsheet