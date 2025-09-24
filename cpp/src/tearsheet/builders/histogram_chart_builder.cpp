#include "epoch_dashboard/tearsheet/histogram_chart_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include "epoch_dashboard/tearsheet/series_converter.h"

namespace epoch_tearsheet {

HistogramChartBuilder::HistogramChartBuilder() {
    histogram_def_.mutable_chart_def()->set_type(epoch_proto::WidgetHistogram);
}

HistogramChartBuilder& HistogramChartBuilder::setTitle(const std::string& title) {
    histogram_def_.mutable_chart_def()->set_title(title);
    return *this;
}

HistogramChartBuilder& HistogramChartBuilder::setCategory(const std::string& category) {
    histogram_def_.mutable_chart_def()->set_category(category);
    return *this;
}

HistogramChartBuilder& HistogramChartBuilder::setXAxisLabel(const std::string& label) {
    histogram_def_.mutable_chart_def()->mutable_x_axis()->set_label(label);
    return *this;
}

HistogramChartBuilder& HistogramChartBuilder::setYAxisLabel(const std::string& label) {
    histogram_def_.mutable_chart_def()->mutable_y_axis()->set_label(label);
    return *this;
}

HistogramChartBuilder& HistogramChartBuilder::setData(const epoch_proto::Array& data) {
    *histogram_def_.mutable_data() = data;
    return *this;
}

HistogramChartBuilder& HistogramChartBuilder::addStraightLine(const epoch_proto::StraightLineDef& line) {
    *histogram_def_.add_straight_lines() = line;
    return *this;
}

HistogramChartBuilder& HistogramChartBuilder::setBinsCount(uint32_t bins) {
    histogram_def_.set_bins_count(bins);
    return *this;
}

HistogramChartBuilder& HistogramChartBuilder::fromSeries(const epoch_frame::Series& series, uint32_t bins) {
    *histogram_def_.mutable_data() = SeriesFactory::toArray(series);
    histogram_def_.set_bins_count(bins);
    return *this;
}

HistogramChartBuilder& HistogramChartBuilder::fromDataFrame(const epoch_frame::DataFrame& df,
                                                              const std::string& column,
                                                              uint32_t bins) {
    *histogram_def_.mutable_data() = DataFrameFactory::toArray(df, column);
    histogram_def_.set_bins_count(bins);
    return *this;
}

epoch_proto::Chart HistogramChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_histogram_def() = histogram_def_;
    return chart;
}

} // namespace epoch_tearsheet