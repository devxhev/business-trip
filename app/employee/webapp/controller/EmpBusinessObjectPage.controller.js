sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
  ],
  function (Controller, Fragment, JSONModel) {
    "use strict";
    return Controller.extend(
      "at.clouddna.employee.controller.EmpBusinessObjectPage",
      {
        _fragmentList: {},
        onInit: function () {
          let oRouter = this.getOwnerComponent().getRouter();
          const oEditModel = new JSONModel({ editMode: false });
          this.getView().setModel(oEditModel, "editModel");
          this._showBusinessFragment("EmpBusinessObjectPageDisplay");
          oRouter
            .getRoute("EmpBusinessObjectPage")
            .attachPatternMatched(this._onPatternMatched, this);
        },

        _onPatternMatched: function (oEvent) {
          let sID = oEvent.getParameter("arguments").key;
          let sPath = "/BusinessTrip(" + sID + ")";
          this.getView().bindElement({
            path: sPath,
          });
        },
        formatStatusState: function (sStatus) {
          if (sStatus === "Neu") {
            return "Information";
          } else if (
            sStatus === "Bereit zur Bearbeitung" ||
            sStatus === "In Bearbeitung"
          ) {
            return "Warning";
          } else if (sStatus === "Gebucht") {
            return "Indication06";
          } else if (sStatus === "Abgeschlossen") {
            return "Success";
          } else if (sStatus === "Storniert") {
            return "Error";
          } else {
            return "None";
          }
        },

        _showBusinessFragment: function (fragmentName) {
          let page = this.getView().byId("EmpBusinessObjectPage");
          page.removeAllSections();
          if (!this._fragmentList[fragmentName]) {
            Fragment.load({
              id: this.getView().createId(fragmentName),
              name: "at.clouddna.employee.view.fragments." + fragmentName,
              controller: this,
            }).then(
              function (oFragment) {
                this._fragmentList[fragmentName] = oFragment;
                page.addSection(oFragment);
                return oFragment;
              }.bind(this)
            );
          } else {
            page.addSection(this._fragmentList[fragmentName]);
          }
        },
        _toggleEdit: function (bEdit) {
          let oEditModel = this.getView().getModel("editModel");
          oEditModel.setProperty("/editMode", bEdit);

          this._showBusinessFragment(
            bEdit ? "EmpBusinessObjectPageEdit" : "EmpBusinessObjectPageDisplay"
          );
        },
        onEditPressed: function () {
          this._toggleEdit(true);
        },

        formatFileSize: function (size) {
          if (size === null || size === undefined) return "";
          if (size < 1024) return size + " B";
          if (size < 1024 * 1024) return Math.round(size / 1024) + " KB";
          return Math.round(size / (1024 * 1024)) + " MB";
        },
        formatDateTime: function (v) {
          if (!v) return "";
          try {
            return new Date(v).toLocaleString();
          } catch (e) {
            return v;
          }
        },
        formatMessage: function (m) {
          if (!m) return "";
          return m.replace(/\n/g, "<br/>");
        },

        onAddCommentPress: function () {
          const ctx = this.getView().getBindingContext();
          if (!ctx) return;

          // Dialog für neuen Kommentar
          if (!this._oCommentDialog) {
            this._oCommentDialog = new sap.m.Dialog({
              title: "Neuer Kommentar",
              contentWidth: "400px",
              contentHeight: "300px",
              resizable: true,
              content: [
                new sap.m.VBox({
                  items: [
                    new sap.m.Label({ text: "Nachricht:" }),
                    new sap.m.TextArea({
                      id: "commentTextArea",
                      rows: 5,
                      width: "100%",
                      placeholder: "Kommentar eingeben...",
                    }),
                  ],
                }),
              ],
              beginButton: new sap.m.Button({
                text: "Hinzufügen",
                type: "Emphasized",
                press: () => {
                  const textArea = sap.ui.getCore().byId("commentTextArea");
                  const message = textArea.getValue();

                  if (message.trim()) {
                    // Comment über BusinessTrip Draft erstellen (Root Entity)
                    const model = this.getView().getModel();
                    const businessTripObj = ctx.getObject();

                    // Erst Draft erstellen falls noch nicht vorhanden
                    const createComment = async () => {
                      try {
                        let draftPath = ctx.getPath();

                        // Falls aktive Entity, erst Draft erstellen
                        if (businessTripObj.IsActiveEntity) {
                          const draftCtx = await model
                            .bindContext(
                              ctx.getPath() + "/BusinessService.draftEdit(...)"
                            )
                            .execute();
                          draftPath = draftCtx.getPath();
                        }

                        // Comment über Draft BusinessTrip/comments erstellen
                        const commentsBinding = model.bindList(
                          draftPath + "/comments"
                        );
                        const newComment = commentsBinding.create({
                          message: message.trim(),
                          createdBy: "current.user@example.com",
                          createdAt: new Date().toISOString(),
                        });

                        // Dialog schließen und zurücksetzen
                        textArea.setValue("");
                        this._oCommentDialog.close();
                        sap.m.MessageToast.show("Kommentar hinzugefügt");
                      } catch (e) {
                        console.error("Comment creation failed:", e);
                        sap.m.MessageToast.show(
                          "Fehler beim Erstellen des Kommentars"
                        );
                      }
                    };

                    createComment();
                  } else {
                    sap.m.MessageToast.show(
                      "Bitte geben Sie einen Kommentar ein"
                    );
                  }
                },
              }),
              endButton: new sap.m.Button({
                text: "Abbrechen",
                press: () => {
                  sap.ui.getCore().byId("commentTextArea").setValue("");
                  this._oCommentDialog.close();
                },
              }),
            });
          }

          this._oCommentDialog.open();
        },

        onUploadComplete: function (oEvent) {
          const file = oEvent.getParameter("files")[0];
          const ctx = this.getView().getBindingContext();

          if (!file || !ctx) {
            sap.m.MessageToast.show("Fehler beim Upload");
            return;
          }

          // FileReader für Base64 Konvertierung
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Content = reader.result.split(",")[1]; // Remove data:image/... prefix
              const model = this.getView().getModel();
              const businessTripObj = ctx.getObject();

              let draftPath = ctx.getPath();

              // Falls aktive Entity, erst Draft erstellen
              if (businessTripObj.IsActiveEntity) {
                const draftCtx = await model
                  .bindContext(
                    ctx.getPath() + "/BusinessService.draftEdit(...)"
                  )
                  .execute();
                draftPath = draftCtx.getPath();
              }

              // Attachment über Draft BusinessTrip/attachments erstellen
              const attachmentsBinding = model.bindList(
                draftPath + "/attachments"
              );
              const newAttachment = attachmentsBinding.create({
                fileName: file.name,
                description: `Uploaded: ${file.name}`,
                mediaType: file.type || "application/octet-stream",
                size: file.size,
                content: base64Content,
                createdBy: "current.user@example.com",
                createdAt: new Date().toISOString(),
              });

              sap.m.MessageToast.show(
                `Datei "${file.name}" erfolgreich hochgeladen`
              );

              // FileUploader zurücksetzen
              oEvent.getSource().clear();
            } catch (e) {
              console.error("Upload failed:", e);
              sap.m.MessageToast.show("Fehler beim Upload: " + e.message);
            }
          };

          reader.onerror = () => {
            sap.m.MessageToast.show("Fehler beim Lesen der Datei");
          };

          // Datei als Base64 lesen
          reader.readAsDataURL(file);
        },
        onEdit: async function () {
          const oView = this.getView();
          const model = oView.getModel();
          const editVM = oView.getModel("editModel");
          const ctx = oView.getBindingContext();
          if (!ctx) return;

          // Bereits im Edit-Modus? Abbrechen
          if (editVM.getProperty("/editMode")) return;

          const obj = ctx.getObject();
          if (!obj || !obj.ID) return;

          let draftPath = ctx.getPath();
          oView.setBusy(true);

          try {
            // Falls aktive Entität: Draft erzeugen
            if (obj.IsActiveEntity) {
              try {
                await model
                  .bindContext(draftPath + "/BusinessService.draftEdit(...)")
                  .execute();
                // Draft Pfad (manuell, execute liefert oft weiterhin aktiven Pfad)
                draftPath = `/BusinessTrip(ID='${obj.ID}',IsActiveEntity=false)`;
              } catch (e) {
                console.error("Draft Edit Action Fehler", e);
                sap.m.MessageToast.show("Draft konnte nicht erstellt werden");
                oView.setBusy(false);
                return;
              }
            }

            // View an Draft binden (inkl. notwendiger Expansions)
            oView.bindElement({
              path: draftPath,
              parameters: {
                $expand: "attachments,comments,flights,employee,status,booking",
              },
              events: {
                dataRequested: () => oView.setBusy(true),
                dataReceived: () => oView.setBusy(false),
              },
            });

            // In Edit-Modus schalten
            this._toggleEdit(true);
            sap.m.MessageToast.show("Bearbeitungsmodus aktiv");
          } finally {
            oView.setBusy(false);
          }
        },
        onCancel: function () {
          const m = this.getView().getModel();
          if (m.hasPendingChanges()) {
            m.resetChanges(); // verwirft lokale Draft-Änderungen
          }
          const ctx = this.getView().getBindingContext();
          let id;
          if (ctx) {
            const obj = ctx.getObject();
            if (obj && obj.ID) id = obj.ID;
          }
          if (id) {
            // Zur aktiven Entität zurück
            this.getView().bindElement({
              path: `/BusinessTrip(ID='${id}',IsActiveEntity=true)`,
              parameters: {
                $expand: "attachments,comments,flights,employee,status,booking",
              },
            });
          }
          this._toggleEdit(false);
          sap.m.MessageToast.show("Änderungen verworfen");
        },

        // ...existing code...
        _validateAndPrepareAssociations: function (ctx) {
          const obj = ctx.getObject();
          const errors = [];

          // Pflicht-Associations (anpassen falls etwas optional bleiben soll)
          // employee ist schon @mandatory im Modell
          if (!obj.employee || !obj.employee.ID)
            errors.push("Mitarbeiter fehlt");
          if (!obj.status || !obj.status.ID) errors.push("Status fehlt");
          if (!obj.booking || !obj.booking.ID) errors.push("Booking fehlt");

          // Beispiel: mind. 1 Flight & 1 Attachment verlangen
          if (!obj.flights || obj.flights.length === 0)
            errors.push("Mindestens ein Flug fehlt");
          if (!obj.attachments || obj.attachments.length === 0)
            errors.push("Mindestens ein Anhang fehlt");

          if (errors.length) {
            sap.m.MessageBox.error(errors.join("\n"));
            return false;
          }

          // Fremdschlüssel (Draft) setzen – nur falls Navigation vorhanden
          if (obj.employee?.ID) ctx.setProperty("employee_ID", obj.employee.ID);
          if (obj.status?.ID) ctx.setProperty("status_ID", obj.status.ID);
          if (obj.booking?.ID) ctx.setProperty("booking_ID", obj.booking.ID);

          return true;
        },
        onSave: async function () {
          const m = this.getView().getModel();
          const ctx = this.getView().getBindingContext();
          if (!ctx) return;

          const obj = ctx.getObject();
          if (!obj) return;

          // Wenn wir noch auf der aktiven Entität wären, wäre das ein Fehler im Flow
          if (obj.IsActiveEntity) {
            sap.m.MessageToast.show("Kein Draft zum Speichern");
            return;
          }

          this.getView().setBusy(true);
          try {
            // Änderungen der Draft-Entity senden (Gruppe $auto oder deine updateGroupId)
            await m.submitBatch("$auto");

            // Draft aktivieren
            await m
              .bindContext(
                ctx.getPath() + "/BusinessService.draftActivate(...)"
              )
              .execute();

            // Nach Aktivierung wieder auf aktive Entität binden
            const id = obj.ID;
            this.getView().bindElement({
              path: `/BusinessTrip(ID='${id}',IsActiveEntity=true)`,
              parameters: {
                $expand: "attachments,comments,flights,employee,status,booking",
              },
            });

            this._toggleEdit(false);
            sap.m.MessageToast.show("Gespeichert");
          } catch (e) {
            console.error(e);
            sap.m.MessageToast.show("Fehler beim Speichern");
          } finally {
            this.getView().setBusy(false);
          }
        },

        onDeleteComment: function (oEvent) {
          const ctx = oEvent.getSource().getBindingContext();
          if (ctx) {
            ctx.delete().then(() => {
              sap.m.MessageToast.show("Kommentar gelöscht");
            });
          }
        },

        formatSwitchState: function (sValue) {
          return sValue === "X";
        },

        onNavBack: function () {
          this.getOwnerComponent().getRouter().navTo("BusinessTripList");
        },
      }
    );
  }
);
