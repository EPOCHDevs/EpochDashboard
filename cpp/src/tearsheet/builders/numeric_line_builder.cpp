#include "epoch_dashboard/tearsheet/numeric_line_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include <epoch_frame/series.h>
#include <epoch_frame/index.h>
#include <arrow/api.h>

namespace epoch_tearsheet {

NumericLineBuilder& NumericLineBuilder::setName(const std::string& name) {
    line_.set_name(name);
    return *this;
}

NumericLineBuilder& NumericLineBuilder::setDashStyle(epoch_proto::DashStyle style) {
    line_.set_dash_style(style);
    return *this;
}

NumericLineBuilder& NumericLineBuilder::setLineWidth(uint32_t width) {
    line_.set_line_width(width);
    return *this;
}

NumericLineBuilder& NumericLineBuilder::addPoints(const std::vector<epoch_proto::NumericPoint>& points) {
    for (const auto& point : points) {
        *line_.add_data() = point;
    }
    return *this;
}

NumericLineBuilder& NumericLineBuilder::fromSeries(const epoch_frame::Series& series) {
    auto index = series.index();
    const auto arr = series.contiguous_array().to_view<double>();

    auto index_array = index->array();
    auto index_type = index_array->type();

    // NumericLine requires floating point x-axis values
    // We support float32, float64, int64, and uint64 index types
    // Integer types will be converted to double

    if (index_type->id() == arrow::Type::DOUBLE) {
        const auto double_view = index_array.to_view<double>();
        for (uint64_t i = 0; i < series.size(); ++i) {
            auto* point = line_.add_data();
            point->set_x(double_view->Value(i));
            point->set_y(arr->Value(i));
        }
    } else if (index_type->id() == arrow::Type::FLOAT) {
        const auto float_view = index_array.to_view<float>();
        for (uint64_t i = 0; i < series.size(); ++i) {
            auto* point = line_.add_data();
            point->set_x(static_cast<double>(float_view->Value(i)));
            point->set_y(arr->Value(i));
        }
    } else if (index_type->id() == arrow::Type::INT64) {
        const auto int64_view = index_array.to_view<int64_t>();
        for (uint64_t i = 0; i < series.size(); ++i) {
            auto* point = line_.add_data();
            point->set_x(static_cast<double>(int64_view->Value(i)));
            point->set_y(arr->Value(i));
        }
    } else if (index_type->id() == arrow::Type::UINT64) {
        const auto uint64_view = index_array.to_view<uint64_t>();
        for (uint64_t i = 0; i < series.size(); ++i) {
            auto* point = line_.add_data();
            point->set_x(static_cast<double>(uint64_view->Value(i)));
            point->set_y(arr->Value(i));
        }
    } else {
        throw std::runtime_error("Index must be a numeric type (float, double, int64, or uint64) for NumericLine conversion. "
                                 "Timestamp types are not supported. Received type: " + index_type->ToString());
    }

    return *this;
}

epoch_proto::NumericLine NumericLineBuilder::build() const {
    return line_;
}

} // namespace epoch_tearsheet