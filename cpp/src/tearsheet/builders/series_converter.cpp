#include "epoch_dashboard/tearsheet/series_converter.h"
#include "epoch_dashboard/tearsheet/scalar_converter.h"
#include <epoch_frame/series.h>
#include <epoch_frame/index.h>

namespace epoch_tearsheet {

epoch_proto::Array SeriesFactory::toArray(const epoch_frame::Series& series) {
    epoch_proto::Array array;

    for (uint64_t i = 0; i < series.size(); ++i) {
        auto scalar = series.iloc(i);
        *array.add_values() = ScalarFactory::create(scalar);
    }

    return array;
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
    for (uint64_t i = 0; i < series.size(); ++i) {
        auto* point = line.add_data();
        point->set_x(static_cast<int64_t>(index->at(i).as_double()));
        point->set_y(series.iloc(i).as_double());
    }

    return line;
}

epoch_proto::Point SeriesFactory::toPoint(const epoch_frame::Series& x_series,
                                          const epoch_frame::Series& y_series,
                                          uint64_t index) {
    epoch_proto::Point point;
    point.set_x(static_cast<int64_t>(x_series.iloc(index).as_double()));
    point.set_y(y_series.iloc(index).as_double());
    return point;
}

std::vector<epoch_proto::Point> SeriesFactory::toPoints(const epoch_frame::Series& x_series,
                                                         const epoch_frame::Series& y_series) {
    std::vector<epoch_proto::Point> points;
    uint64_t size = std::min(x_series.size(), y_series.size());
    points.reserve(size);

    for (uint64_t i = 0; i < size; ++i) {
        points.push_back(toPoint(x_series, y_series, i));
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