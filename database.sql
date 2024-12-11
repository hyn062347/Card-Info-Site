card(
card_name varchar,
card_number number,
constraint card_pk primary key(card_name, card_number)
);

site(
site_name varchar,
card_name varchar,
card_number number,
card_normal_price varchar,
card_foil_price varcahr,
update_time timestamp,
constraint site_pk primary key(site_name),
constraint site_fk1 foreign key(card_name) references card(card_name),
constraint site_fk2 foreign key(card_number) refernces card(card_number)
);