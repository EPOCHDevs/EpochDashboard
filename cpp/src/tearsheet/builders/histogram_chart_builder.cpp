#include "epoch_dashboard/tearsheet/histogram_chart_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include "epoch_dashboard/tearsheet/series_converter.h"
#include "epoch_protos/common.pb.h"

namespace epoch_tearsheet {

HistogramChartBuilder::HistogramChartBuilder() {
    histogram_def_.mutable_chart_def()->set_type(epoch_proto::WidgetHistogram);
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

    // Set appropriate axis definitions for histograms
    setXAxisType(epoch_proto::AxisLinear);
    setYAxisType(epoch_proto::AxisLinear);

    // Set default axis labels if not already set
    if (!getChartDef()->x_axis().has_label()) {
        setXAxisLabel("Value");
    }
    if (!getChartDef()->y_axis().has_label()) {
        setYAxisLabel("Frequency");
    }

    return *this;
}

HistogramChartBuilder& HistogramChartBuilder::fromDataFrame(const epoch_frame::DataFrame& df,
                                                              const std::string& column,
                                                              uint32_t bins) {
    *histogram_def_.mutable_data() = DataFrameFactory::toArray(df, column);
    histogram_def_.set_bins_count(bins);

    // Set appropriate axis definitions for histograms
    setXAxisType(epoch_proto::AxisLinear);
    setYAxisType(epoch_proto::AxisLinear);

    // Set default axis labels if not already set
    if (!getChartDef()->x_axis().has_label()) {
        setXAxisLabel(column);
    }
    if (!getChartDef()->y_axis().has_label()) {
        setYAxisLabel("Frequency");
    }

    return *this;
}

epoch_proto::Chart HistogramChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_histogram_def() = histogram_def_;
    return chart;
}

} // namespace epoch_tearsheet