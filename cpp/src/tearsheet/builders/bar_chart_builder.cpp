#include "epoch_dashboard/tearsheet/bar_chart_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include "epoch_dashboard/tearsheet/series_converter.h"

namespace epoch_tearsheet {

BarChartBuilder::BarChartBuilder() {
    bar_def_.mutable_chart_def()->set_type(epoch_proto::WidgetBar);
}

BarChartBuilder& BarChartBuilder::setTitle(const std::string& title) {
    bar_def_.mutable_chart_def()->set_title(title);
    return *this;
}

BarChartBuilder& BarChartBuilder::setCategory(const std::string& category) {
    bar_def_.mutable_chart_def()->set_category(category);
    return *this;
}

BarChartBuilder& BarChartBuilder::setXAxisLabel(const std::string& label) {
    bar_def_.mutable_chart_def()->mutable_x_axis()->set_label(label);
    return *this;
}

BarChartBuilder& BarChartBuilder::setYAxisLabel(const std::string& label) {
    bar_def_.mutable_chart_def()->mutable_y_axis()->set_label(label);
    return *this;
}

BarChartBuilder& BarChartBuilder::setData(const epoch_proto::Array& data) {
    *bar_def_.mutable_data() = data;
    return *this;
}

BarChartBuilder& BarChartBuilder::addStraightLine(const epoch_proto::StraightLineDef& line) {
    *bar_def_.add_straight_lines() = line;
    return *this;
}

BarChartBuilder& BarChartBuilder::setBarWidth(uint32_t width) {
    bar_def_.set_bar_width(width);
    return *this;
}

BarChartBuilder& BarChartBuilder::setVertical(bool vertical) {
    bar_def_.set_vertical(vertical);
    return *this;
}

BarChartBuilder& BarChartBuilder::fromSeries(const epoch_frame::Series& series) {
    *bar_def_.mutable_data() = SeriesFactory::toArray(series);
    return *this;
}

BarChartBuilder& BarChartBuilder::fromDataFrame(const epoch_frame::DataFrame& df, const std::string& column) {
    *bar_def_.mutable_data() = DataFrameFactory::toArray(df, column);
    return *this;
}

epoch_proto::Chart BarChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_bar_def() = bar_def_;
    return chart;
}

} // namespace epoch_tearsheet