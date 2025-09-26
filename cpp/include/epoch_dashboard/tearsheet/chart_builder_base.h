#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"

namespace epoch_tearsheet {

template<typename DerivedBuilder>
class ChartBuilderBase {
protected:
    epoch_proto::ChartDef* getChartDef() {
        return static_cast<DerivedBuilder*>(this)->getChartDefImpl();
    }

public:
    DerivedBuilder& setTitle(const std::string& title) {
        getChartDef()->set_title(title);
        return static_cast<DerivedBuilder&>(*this);
    }

    DerivedBuilder& setCategory(const std::string& category) {
        getChartDef()->set_category(category);
        return static_cast<DerivedBuilder&>(*this);
    }

    DerivedBuilder& setId(const std::string& id) {
        getChartDef()->set_id(id);
        return static_cast<DerivedBuilder&>(*this);
    }

    DerivedBuilder& setXAxisLabel(const std::string& label) {
        getChartDef()->mutable_x_axis()->set_label(label);
        return static_cast<DerivedBuilder&>(*this);
    }

    DerivedBuilder& setYAxisLabel(const std::string& label) {
        getChartDef()->mutable_y_axis()->set_label(label);
        return static_cast<DerivedBuilder&>(*this);
    }

    DerivedBuilder& setXAxisType(epoch_proto::AxisType type) {
        getChartDef()->mutable_x_axis()->set_type(type);
        return static_cast<DerivedBuilder&>(*this);
    }

    DerivedBuilder& setYAxisType(epoch_proto::AxisType type) {
        getChartDef()->mutable_y_axis()->set_type(type);
        return static_cast<DerivedBuilder&>(*this);
    }

    DerivedBuilder& setXAxisCategories(const std::vector<std::string>& categories) {
        auto* x_axis = getChartDef()->mutable_x_axis();
        x_axis->clear_categories();
        for (const auto& category : categories) {
            x_axis->add_categories(category);
        }
        return static_cast<DerivedBuilder&>(*this);
    }

    DerivedBuilder& setYAxisCategories(const std::vector<std::string>& categories) {
        auto* y_axis = getChartDef()->mutable_y_axis();
        y_axis->clear_categories();
        for (const auto& category : categories) {
            y_axis->add_categories(category);
        }
        return static_cast<DerivedBuilder&>(*this);
    }
};

} // namespace epoch_tearsheet