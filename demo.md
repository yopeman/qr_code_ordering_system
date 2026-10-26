# Demo QRCOS

- create qrcos_demo next.js project.
- use next.js + tailwind css + neogram + mongodb + cludinary

## Database Schema

### Admins

- email
- password: nullable (in implementation check whether the password is null or not, if null accept password)
- status: active, inactive

### Restaurants

- _id
- name
- slug
- password: nullable (in implementation check whether the password is null or not, if null accept password)
- description
- detail: Mixed, [{key: '...', value: '...'}]
- logo url
- expired at
- status: active, inactive, suspended
- telegram chat: used for notify on telegram for restaurant, menu and order
- config: [{feeName: '...', type: persent/fixed, amount: number}], e.g: vat: 15%
- created at
- updated at

### Menus

- _id
- category: string
- name
- description
- price
- detail: Mixed, [{key: '...', value: '...'}]
- img urls: [string]
- visibility: public, private

### Orders

- _id
- restaurantId
- details: [
- menuId
- queantity
- unitPrice
- subtotalPrice
- vat, service fee, as restaurant owner configured)
- totalPrice
- ]
- status: pending, priparing, compleated
- order at
- start priparing at
- completed at
- created at
- updated at

## This project has the following main pages:

1. admin page at /admin: here requried auth in `Admins` table. store token in localstorage/cookies with key `qrcos-admin-<token>`
2. restaurant owner page at /r/slug: here requried auth in `Restaurants` table. store token in localstorage/cookies with key `qrcos-restaurant-<token>`
3. menu page at /m/slug: no auth at all
4. order page: /o/slug: admin or specific restaurant owner
5. history page: /my-history: track in localStorage
6. landing page at /

## Admin page & admin capabilities

- all thin are in the same page and modals.
- if not auth (no `qrcos-admin-<token>` token) show email field
- if email exist and password is null ask new + confirm password else accept password and check it
- change password: in modal accept current + new + confirm password
- create, edit, delete and manage restaurant
- reset restaurant password: set null for `Restaurants.password = null`
- list restaurant as table & grid card
- can see restaurant's order
- download qr code: accept table number and generate link contain NEXT_PUBLIC_URL/m/slug?table=12. contain restaurant name and logo, table number, short menu description (like scan and order), qr image. this must be beatiful. finally download image with name: `restaurantNameOrSlug_table_tableNo_QR_code.png`

## Restaurant page & restaurant owner capabilities

- if not auth (no `qrcos-restaurant-<token>` token) then check is `Restaurants.password === null` then accept new + confirm password else accept and verify the password
- manage its restaurant, but can't update expired_at and status.
- change restaurant password: current + new + confirm password
- manage menu
- generate and download qr code like admin
- show restaurant's order

### Menu page

- public
- accept table number from url `?table=`. if not has this query accept it
- can see the restaurant's menu and images (in modal)
- can place order, and store order id to localStorage
- show order status change, (here use telegram webhook to update the order status when click buttons in telegram) and use simple regular fetching after 1 secon no ws or socket.io
