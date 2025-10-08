#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"
#include "epoch_dashboard/tearsheet/chart_builder_base.h"
#include "epoch_dashboard/tearsheet/validation_utils.h"

namespace epoch_frame {
    class DataFrame;
    class Series;
}

namespace epoch_tearsheet {

class HistogramChartBuilder : public ChartBuilderBase<HistogramChartBuilder> {
public:
    HistogramChartBuilder();

    // Required for CRTP base class
    epoch_proto::ChartDef* getChartDefImpl() { return histogram_def_.mutable_chart_def(); }

    // Chart-specific methods
    HistogramChartBuilder& setData(const epoch_proto::Array& data);
    HistogramChartBuilder& addStraightLine(const epoch_proto::StraightLineDef& line);
    HistogramChartBuilder& setBinsCount(uint32_t bins);
    HistogramChartBuilder& fromSeries(const epoch_frame::Series& series, uint32_t bins = 30);
    HistogramChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df, const std::string& column, uint32_t bins = 30);

    epoch_proto::Chart build() const;

private:
    epoch_proto::HistogramDef histogram_def_;
};

} // namespace epoch_tearsheet