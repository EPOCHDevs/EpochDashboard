#include "epoch_dashboard/tearsheet/boxplot_chart_builder.h"

namespace epoch_tearsheet {

BoxPlotChartBuilder::BoxPlotChartBuilder() {
    box_plot_def_.mutable_chart_def()->set_type(epoch_proto::WidgetBoxPlot);
}

BoxPlotChartBuilder& BoxPlotChartBuilder::setTitle(const std::string& title) {
    box_plot_def_.mutable_chart_def()->set_title(title);
    return *this;
}

BoxPlotChartBuilder& BoxPlotChartBuilder::setCategory(const std::string& category) {
    box_plot_def_.mutable_chart_def()->set_category(category);
    return *this;
}

BoxPlotChartBuilder& BoxPlotChartBuilder::setXAxisLabel(const std::string& label) {
    box_plot_def_.mutable_chart_def()->mutable_x_axis()->set_label(label);
    return *this;
}

BoxPlotChartBuilder& BoxPlotChartBuilder::setYAxisLabel(const std::string& label) {
    box_plot_def_.mutable_chart_def()->mutable_y_axis()->set_label(label);
    return *this;
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