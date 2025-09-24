#include "epoch_dashboard/tearsheet/card_builder.h"

namespace epoch_tearsheet {

CardDataBuilder& CardDataBuilder::setTitle(const std::string& title) {
    card_data_.set_title(title);
    return *this;
}

CardDataBuilder& CardDataBuilder::setValue(const epoch_proto::Scalar& value) {
    *card_data_.mutable_value() = value;
    return *this;
}

CardDataBuilder& CardDataBuilder::setType(epoch_proto::EpochFolioType type) {
    card_data_.set_type(type);
    return *this;
}

CardDataBuilder& CardDataBuilder::setGroup(uint64_t group) {
    card_data_.set_group(group);
    return *this;
}

epoch_proto::CardData CardDataBuilder::build() const {
    return card_data_;
}

CardBuilder& CardBuilder::setType(epoch_proto::EpochFolioDashboardWidget type) {
    card_.set_type(type);
    return *this;
}

CardBuilder& CardBuilder::setCategory(const std::string& category) {
    card_.set_category(category);
    return *this;
}

CardBuilder& CardBuilder::addCardData(const epoch_proto::CardData& card_data) {
    *card_.add_data() = card_data;
    return *this;
}

CardBuilder& CardBuilder::setGroupSize(uint64_t group_size) {
    card_.set_group_size(group_size);
    return *this;
}

epoch_proto::CardDef CardBuilder::build() const {
    return card_;
}

} // namespace epoch_tearsheet