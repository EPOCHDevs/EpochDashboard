#include "epoch_dashboard/tearsheet/pie_chart_builder.h"
#include <epoch_frame/dataframe.h>
#include <arrow/api.h>

namespace epoch_tearsheet {

PieChartBuilder::PieChartBuilder() {
    pie_def_.mutable_chart_def()->set_type(epoch_proto::WidgetPie);
}

PieChartBuilder& PieChartBuilder::setTitle(const std::string& title) {
    pie_def_.mutable_chart_def()->set_title(title);
    return *this;
}

PieChartBuilder& PieChartBuilder::setCategory(const std::string& category) {
    pie_def_.mutable_chart_def()->set_category(category);
    return *this;
}

PieChartBuilder& PieChartBuilder::addSeries(const std::string& name,
                                              const std::vector<epoch_proto::PieData>& points,
                                              const PieSize& size,
                                              const std::optional<PieInnerSize>& inner_size) {
    auto* pie_data = pie_def_.add_data();
    pie_data->set_name(name);
    pie_data->set_size(size.toString());
    if (inner_size.has_value()) {
        pie_data->set_inner_size(inner_size->toString());
    }
    for (const auto& point : points) {
        *pie_data->add_points() = point;
    }
    return *this;
}

PieChartBuilder& PieChartBuilder::fromDataFrame(const epoch_frame::DataFrame& df,
                                                  const std::string& name_col,
                                                  const std::string& value_col,
                                                  const std::string& series_name,
                                                  const PieSize& size,
                                                  const std::optional<PieInnerSize>& inner_size) {
    auto arrow_table = df.table();
    auto name_column = arrow_table->GetColumnByName(name_col);
    auto value_column = arrow_table->GetColumnByName(value_col);

    if (name_column && value_column) {
        std::vector<epoch_proto::PieData> points;
        for (int64_t i = 0; i < std::min(name_column->length(), value_column->length()); ++i) {
            auto name_result = name_column->GetScalar(i);
            auto value_result = value_column->GetScalar(i);

            if (name_result.ok() && value_result.ok()) {
                auto name_scalar = name_result.ValueOrDie();
                auto value_scalar = value_result.ValueOrDie();

                if (name_scalar->is_valid && value_scalar->is_valid) {
                    epoch_proto::PieData point;
                    point.set_name(name_scalar->ToString());
                    point.set_y(std::static_pointer_cast<arrow::DoubleScalar>(value_scalar)->value);
                    points.push_back(point);
                }
            }
        }
        addSeries(series_name, points, size, inner_size);
    }

    return *this;
}

epoch_proto::Chart PieChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_pie_def() = pie_def_;
    return chart;
}

} // namespace epoch_tearsheet