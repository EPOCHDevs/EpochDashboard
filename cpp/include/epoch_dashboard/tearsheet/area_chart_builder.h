#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"
#include "epoch_dashboard/tearsheet/chart_builder_base.h"

namespace epoch_frame {
    class DataFrame;
}

namespace epoch_tearsheet {

class AreaChartBuilder : public ChartBuilderBase<AreaChartBuilder> {
public:
    AreaChartBuilder();

    // Required for CRTP base class
    epoch_proto::ChartDef* getChartDefImpl() { return area_def_.mutable_chart_def(); }

    // Chart-specific methods
    AreaChartBuilder& addArea(const epoch_proto::Line& area);
    AreaChartBuilder& addAreas(const std::vector<epoch_proto::Line>& areas);
    AreaChartBuilder& setStacked(bool stacked);
    AreaChartBuilder& setStackType(epoch_proto::StackType stack_type);
    AreaChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df, const std::vector<std::string>& y_cols);

    epoch_proto::Chart build() const;

private:
    epoch_proto::AreaDef area_def_;
};

} // namespace epoch_tearsheet