#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"
#include "epoch_dashboard/tearsheet/chart_builder_base.h"

namespace epoch_frame {
    class DataFrame;
    class Series;
}

namespace epoch_tearsheet {

class BarChartBuilder : public ChartBuilderBase<BarChartBuilder> {
public:
    BarChartBuilder();

    // Required for CRTP base class
    epoch_proto::ChartDef* getChartDefImpl() { return bar_def_.mutable_chart_def(); }

    // Chart-specific methods
    BarChartBuilder& setData(const epoch_proto::Array& data);
    BarChartBuilder& addBarData(const epoch_proto::BarData& data);
    BarChartBuilder& addStraightLine(const epoch_proto::StraightLineDef& line);
    BarChartBuilder& setBarWidth(uint32_t width);
    BarChartBuilder& setVertical(bool vertical);
    BarChartBuilder& setStacked(bool stacked);
    BarChartBuilder& setStackType(epoch_proto::StackType stack_type);
    BarChartBuilder& fromSeries(const epoch_frame::Series& series);
    BarChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df, const std::string& column);

    epoch_proto::Chart build() const;

private:
    epoch_proto::BarDef bar_def_;
};

} // namespace epoch_tearsheet