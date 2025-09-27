#include "epoch_dashboard/tearsheet/bar_chart_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include "epoch_dashboard/tearsheet/series_converter.h"
#include "epoch_protos/common.pb.h"

namespace epoch_tearsheet {

BarChartBuilder::BarChartBuilder() {
    bar_def_.mutable_chart_def()->set_type(epoch_proto::WidgetBar);
}

BarChartBuilder& BarChartBuilder::setData(const epoch_proto::Array& data) {
    // Legacy method - converts Array to BarData format
    bar_def_.clear_data();
    auto* bar_data = bar_def_.add_data();
    bar_data->set_name("Series 1");
    for (const auto& scalar : data.values()) {
        if (scalar.has_decimal_value()) {
            bar_data->add_values(scalar.decimal_value());
        } else if (scalar.has_integer_value()) {
            bar_data->add_values(static_cast<double>(scalar.integer_value()));
        }
    }
    return *this;
}

BarChartBuilder& BarChartBuilder::addBarData(const epoch_proto::BarData& data) {
    *bar_def_.add_data() = data;
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

BarChartBuilder& BarChartBuilder::setStacked(bool stacked) {
    bar_def_.set_stacked(stacked);
    return *this;
}

BarChartBuilder& BarChartBuilder::setStackType(epoch_proto::StackType stack_type) {
    bar_def_.set_stack_type(stack_type);
    return *this;
}

BarChartBuilder& BarChartBuilder::fromSeries(const epoch_frame::Series& series) {
    // Convert Series to BarData format
    auto array = SeriesFactory::toArray(series);
    bar_def_.clear_data();
    auto* bar_data = bar_def_.add_data();
    bar_data->set_name("Series 1");
    for (const auto& scalar : array.values()) {
        if (scalar.has_decimal_value()) {
            bar_data->add_values(scalar.decimal_value());
        } else if (scalar.has_integer_value()) {
            bar_data->add_values(static_cast<double>(scalar.integer_value()));
        }
    }

    // Set appropriate axis definitions for bar charts
    setXAxisType(epoch_proto::AxisCategory);
    setYAxisType(epoch_proto::AxisLinear);

    // Set default axis labels if not already set
    if (!getChartDef()->x_axis().has_label()) {
        setXAxisLabel("Category");
    }
    if (!getChartDef()->y_axis().has_label()) {
        setYAxisLabel("Value");
    }

    return *this;
}

BarChartBuilder& BarChartBuilder::fromDataFrame(const epoch_frame::DataFrame& df, const std::string& column) {
    // Convert DataFrame column to BarData format
    auto array = DataFrameFactory::toArray(df, column);
    bar_def_.clear_data();
    auto* bar_data = bar_def_.add_data();
    bar_data->set_name(column);
    for (const auto& scalar : array.values()) {
        if (scalar.has_decimal_value()) {
            bar_data->add_values(scalar.decimal_value());
        } else if (scalar.has_integer_value()) {
            bar_data->add_values(static_cast<double>(scalar.integer_value()));
        }
    }

    // Set appropriate axis definitions for bar charts
    setXAxisType(epoch_proto::AxisCategory);
    setYAxisType(epoch_proto::AxisLinear);

    // Set default axis labels if not already set
    if (!getChartDef()->x_axis().has_label()) {
        setXAxisLabel("Category");
    }
    if (!getChartDef()->y_axis().has_label()) {
        setYAxisLabel(column);  // Use column name as label
    }

    return *this;
}

epoch_proto::Chart BarChartBuilder::build() const {
    epoch_proto::Chart chart;
    *chart.mutable_bar_def() = bar_def_;
    return chart;
}

} // namespace epoch_tearsheet