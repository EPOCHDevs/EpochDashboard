#pragma once

#include <string>

#include "epoch_protos/table_def.pb.h"

namespace epoch_tearsheet {

class CardDataBuilder {
public:
    CardDataBuilder& setTitle(const std::string& title);
    CardDataBuilder& setValue(const epoch_proto::Scalar& value);
    CardDataBuilder& setType(epoch_proto::EpochFolioType type);
    CardDataBuilder& setGroup(uint64_t group);

    epoch_proto::CardData build() const;

private:
    epoch_proto::CardData card_data_;
};

class CardBuilder {
public:
    CardBuilder& setType(epoch_proto::EpochFolioDashboardWidget type);
    CardBuilder& setCategory(const std::string& category);
    CardBuilder& addCardData(const epoch_proto::CardData& card_data);
    CardBuilder& setGroupSize(uint64_t group_size);

    epoch_proto::CardDef build() const;

private:
    epoch_proto::CardDef card_;
};

} // namespace epoch_tearsheet