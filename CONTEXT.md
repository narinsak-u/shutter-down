# Shutter Down

This context describes a public photography gallery where an administrator publishes photos and visitors can interact with them anonymously.

## People

**Admin**:
The person responsible for publishing photos and moderating visitor activity.
_Avoid_: user, account owner

**Admin Session**:
The authenticated period during which the Admin may access protected gallery management actions.
_Avoid_: login token, admin user

**Visitor**:
A person viewing the public gallery or interacting with a photo without signing in.
_Avoid_: anonymous user, customer

## Gallery

**Photo**:
A published photographic work shown in the gallery with descriptive metadata.
_Avoid_: post, asset

**Image Asset**:
The image file associated with a photo.
_Avoid_: photo, attachment

**Photo Metadata**:
The descriptive information attached to a photo: location, capture date, category, and accessibility text.
_Avoid_: image data, content fields

**Photo Upload**:
An Admin's submission of one Image Asset and its Photo Metadata for publication in the gallery.
_Avoid_: post, media upload

**Capture Date**:
The calendar date on which a photograph was taken, independent of time zone.
_Avoid_: upload date, publish date

## Visitor Activity

**Like**:
A Visitor's one active expression of appreciation for a specific photo, which the Visitor may remove.
_Avoid_: vote, reaction

**Comment**:
Text submitted by a Visitor about a specific photo.
_Avoid_: review, message

**Pending Comment**:
A submitted comment awaiting Admin approval and therefore hidden from other Visitors.
_Avoid_: draft comment

**Approved Comment**:
A submitted comment that the Admin has allowed to appear in the public gallery.
_Avoid_: published comment, visible message

**Visitor Hash**:
A privacy-preserving identifier used to limit repeated activity from the same apparent Visitor without retaining the raw IP address.
_Avoid_: IP address, user ID
