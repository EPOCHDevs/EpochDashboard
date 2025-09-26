#include "epoch_dashboard/tearsheet/boxplot_chart_builder.h"

namespace epoch_tearsheet {

BoxPlotChartBuilder::BoxPlotChartBuilder() {
    box_plot_def_.mutable_chart_def()->set_type(epoch_proto::WidgetBoxPlot);
}

BoxPlotChartBuilder& BoxPlotChartBuilder::addOutlier(const epoch_proto::BoxPlotOutlier& outlier) {
    *box_plot_def_.mutable_data()->add_outliers() = outlier;
    return *this;
}

BoxPlotChartBuilder& BoxPlotChartBuilder::addDataPoint(const epoch_proto::BoxPlotDataPoint& point) {
    *box_plot_def_.mutable_data()->add_points() = point;
    return *this;
}

epoch_proto::Chart BoxPlotChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_box_plot_def() = box_plot_def_;
    return chart;
}

} // namespace epoch_tearsheet