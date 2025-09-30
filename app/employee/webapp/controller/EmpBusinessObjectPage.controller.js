sap.ui.define(
  [
    "sap/fe/core/PageController",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
  ],
  function (PageController, Fragment, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return PageController.extend(
      "at.clouddna.employee.view.EmpBusinessObjectPage",
      {
        _fragmentList: {},

        onInit: function () {
          const oEditModel = new JSONModel({ editMode: false });
          this.getView().setModel(oEditModel, "editModel");

          const router = this.getAppComponent().getRouter();
          router
            .getRoute("BusinessTripObjectPage")
            .attachPatternMatched(this._onPatternMatched, this);
          PageController.prototype.onInit.apply(this, arguments);
        },

        _onPatternMatched: function (oEvent) {
          setTimeout(() => {
            const oContext = this.getView().getBindingContext();

            if (!oContext) return;

            const bIsActive = oContext.getProperty("IsActiveEntity");

            if (bIsActive) {
              this._toggleEdit(false);
            } else {
              this._toggleEdit(true);
            }
          }, 200);
        },

        formatStatusState: function (sStatus) {
          if (sStatus === "Neu") return "Information";
          if (
            sStatus === "Bereit zur Bearbeitung" ||
            sStatus === "In Bearbeitung"
          )
            return "Warning";
          if (sStatus === "Gebucht") return "Indication06";
          if (sStatus === "Abgeschlossen") return "Success";
          if (sStatus === "Storniert") return "Error";
          return "None";
        },

        _toggleEdit: function (bEdit) {
          let oEditModel = this.getView().getModel("editModel");
          oEditModel.setProperty("/editMode", bEdit);
          if (bEdit) this._suspendResumeFlightSelects();
        },

        formatFileSize: function (size) {
          if (size == null) return "";
          if (size < 1024) return size + " B";
          if (size < 1024 * 1024) return Math.round(size / 1024) + " KB";
          return Math.round(size / (1024 * 1024)) + " MB";
        },

        formatDateTime: function (v) {
          if (!v) return "";
          try {
            const d = new Date(v);
            if (Number.isNaN(d.getTime())) return String(v);
            return d.toLocaleString();
          } catch (e) {
            return String(v);
          }
        },

        formatMessage: function (m) {
          if (!m) return "";
          return m.replace(/\n/g, "<br/>");
        },

        /**
         * Kommentar hinzufügen
         */
        onAddCommentPress: async function () {
          const ctx = this.getView().getBindingContext();
          if (!ctx) return;

          const obj = ctx.getObject();
          if (!obj) return;

          try {
            if (obj.IsActiveEntity) {
              await this.editFlow.editDocument(ctx);
            }

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
                  press: async () => {
                    const textArea = sap.ui.getCore().byId("commentTextArea");
                    const message = textArea.getValue();

                    if (!message.trim()) {
                      sap.m.MessageToast.show(
                        "Bitte geben Sie einen Kommentar ein"
                      );
                      return;
                    }

                    try {
                      // Comment über Draft-Context erstellen
                      const draftCtx = this.getView().getBindingContext();
                      const model = draftCtx.getModel();
                      const commentsBinding = model.bindList(
                        draftCtx.getPath() + "/comments"
                      );

                      const newComment = commentsBinding.create({
                        message: message.trim(),
                        createdBy: "current.user@example.com",
                        createdAt: new Date().toISOString(),
                      });

                      // Warten bis Kommentar erstellt wurde
                      await newComment.created();

                      textArea.setValue("");
                      this._oCommentDialog.close();
                      sap.m.MessageToast.show("Kommentar hinzugefügt");

                      try {
                        await this.editFlow.saveDocument(draftCtx);
                      } catch (sideEffectError) {
                        console.warn(
                          "SideEffect request failed:",
                          sideEffectError
                        );
                        // Fallback: Model refresh
                        model.refresh();
                      }
                    } catch (e) {
                      console.error("Comment creation failed:", e);
                      sap.m.MessageToast.show(
                        "Fehler beim Erstellen des Kommentars"
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
          } catch (e) {
            console.error("Edit preparation failed:", e);
            sap.m.MessageToast.show(
              "Fehler beim Vorbereiten der Kommentar-Eingabe"
            );
          }
        },
        onDeleteAttachment: async function (oEvent) {
          const oItem = oEvent.getParameter("listItem");
          if (!oItem) return;
          const oCtx = oItem.getBindingContext();
          if (!oCtx) return;

          try {
            await oCtx.delete();
            sap.m.MessageToast.show("Anhang gelöscht");
          } catch (e) {
            console.error("Delete attachment failed:", e);
            sap.m.MessageBox.error(
              e.message || "Fehler beim Löschen des Anhangs"
            );
          }
        },

        onEdit: async function () {
          const oCtx = this.getView().getBindingContext();
          if (!oCtx) return;

          const obj = oCtx.getObject();
          if (!obj) return;

          try {
            if (obj.IsActiveEntity) {
              await this.editFlow.editDocument(oCtx);
            }
            await this._toggleEdit(true);
            sap.m.MessageToast.show("Bearbeitungsmodus aktiv");
          } catch (e) {
            console.error("Edit failed:", e);
            sap.m.MessageToast.show(
              "Fehler beim Wechsel in den Bearbeitungsmodus"
            );
          }
        },

        onCancel: async function () {
          const oView = this.getView();
          const oCtx = oView.getBindingContext();
          if (!oCtx) return;

          try {
            await this.editFlow.cancelDocument(oCtx, {
              skipDiscardPopover: true,
              control: oView,
            });
          } catch (e) {
            MessageBox.error(e.message || "Cancel failed");
            return;
          }

          this._toggleEdit(false);

          MessageToast.show("Änderungen verworfen");
        },

        onSave: async function () {
          const oView = this.getView();
          const oCtx = oView.getBindingContext();
          if (!oCtx) return;

          try {
            console.log("Saving", oCtx.getObject());
            await this.editFlow.saveDocument(oCtx);

            this._toggleEdit(false);
            sap.m.MessageToast.show("Gespeichert");
          } catch (e) {
            console.error("Save failed:", e);
            sap.m.MessageBox.error(e.message || "Fehler beim Speichern");
          }
        },

        onDeleteComment: async function (oEvent) {
          const oItem = oEvent.getParameter("listItem");
          if (!oItem) return;
          const oCtx = oItem.getBindingContext();
          if (!oCtx) return;

          try {
            await oCtx.delete();
            sap.m.MessageToast.show("Kommentar gelöscht");
          } catch (e) {
            console.error("Delete comment failed:", e);
            sap.m.MessageBox.error(
              e.message || "Fehler beim Löschen des Kommentars"
            );
          }
        },
        onSubmit: async function () {
          const oView = this.getView();
          const oCtx = oView.getBindingContext();
          if (!oCtx) return;

          try {
            const draftCtx = this.getView().getBindingContext();
            if (!draftCtx) {
              sap.m.MessageToast.show(
                "Draft-Context konnte nicht erstellt werden"
              );
              return;
            }
            switch (draftCtx.getObject().booking.status.name) {
              case "Neu":
                draftCtx.setProperty(
                  "booking/status_ID",
                  "550e8400-e29b-41d4-a716-446655440001"
                );
                break;
              case "Bereit zur Bearbeitung":
                draftCtx.setProperty(
                  "booking/status_ID",
                  "550e8400-e29b-41d4-a716-446655440002"
                );
                break;
              case "In Bearbeitung":
                draftCtx.setProperty(
                  "booking/status_ID",
                  "550e8400-e29b-41d4-a716-446655440003"
                );
                break;
              case "Gebucht":
                draftCtx.setProperty(
                  "booking/status_ID",
                  "550e8400-e29b-41d4-a716-446655440004"
                );
                break;
              case "Abgeschlossen":
                sap.m.MessageToast.show(
                  "Die Buchung ist bereits abgeschlossen."
                );
                return;
              case "Storniert":
                sap.m.MessageToast.show(
                  "Die Buchung wurde storniert und kann nicht weiter bearbeitet werden."
                );
                return;
              default:
                sap.m.MessageToast.show(
                  "Unbekannter Status. Einreichen nicht möglich."
                );
                return;
            }
            await this.editFlow.saveDocument(draftCtx);
          } catch (e) {
            console.error("Submit failed:", e);
            sap.m.MessageBox.error(e.message || "Fehler beim Einreichen");
          }
        },

        formatSwitchState: function (sValue) {
          return sValue === "X";
        },

        onNavBack: function () {
          const oHistory = sap.ui.core.routing.History.getInstance();
          const sPreviousHash = oHistory.getPreviousHash();

          if (sPreviousHash === undefined) {
            window.history.go(-1);
          } else {
            const oRouter = this.getAppComponent().getRouter();
            oRouter.navTo("BusinessTripList", {}, true);
          }
        },

        _fb: function (fragmentId, localId) {
          const fragId = this.getView().createId(fragmentId);
          return Fragment.byId(fragId, localId);
        },

        onFileChange: async function (oEvent) {
          const oFileUploader = oEvent.getSource();
          const sValue = oFileUploader.getValue();

          if (!sValue) {
            return;
          }

          const oDomRef = oFileUploader.getDomRef();
          const oFile =
            oDomRef &&
            oDomRef.querySelector("input[type=file]") &&
            oDomRef.querySelector("input[type=file]").files[0];

          if (!oFile) {
            sap.m.MessageToast.show("Keine Datei ausgewählt");
            return;
          }

          const ctx = this.getView().getBindingContext();
          if (!ctx) {
            sap.m.MessageToast.show("Fehler beim Upload - kein Context");
            return;
          }

          try {
            const obj = ctx.getObject();
            let draftCtx = ctx;

            if (obj && obj.IsActiveEntity) {
              draftCtx = await this.editFlow.editDocument(ctx);
            }

            if (!draftCtx) {
              sap.m.MessageToast.show(
                "Draft-Context konnte nicht erstellt werden"
              );
              return;
            }

            const reader = new FileReader();
            reader.onload = async () => {
              try {
                const base64Content = reader.result.split(",")[1];
                const model = draftCtx.getModel();

                const attachmentsBinding = model.bindList(
                  draftCtx.getPath() + "/attachments"
                );

                const newAttachment = attachmentsBinding.create({
                  fileName: oFile.name,
                  description: `Uploaded: ${oFile.name}`,
                  mediaType: oFile.type || "application/octet-stream",
                  size: oFile.size,
                  content: base64Content,
                  // createdBy/createdAt werden automatisch von @managed gesetzt
                });

                // Warten bis erstellt
                await newAttachment.created();
                console.log("Attachment created:", newAttachment);

                sap.m.MessageToast.show(
                  `Datei "${oFile.name}" erfolgreich hochgeladen`
                );
                oFileUploader.clear();

                // SideEffects für sofortige Anzeige
                try {
                  await this.editFlow.saveDocument(draftCtx);
                } catch (sideEffectError) {
                  console.warn("SideEffect request failed:", sideEffectError);
                  model.refresh();
                }
              } catch (e) {
                console.error("Upload failed:", e);
                sap.m.MessageToast.show("Fehler beim Upload: " + e.message);
              }
            };

            reader.onerror = () => {
              sap.m.MessageToast.show("Fehler beim Lesen der Datei");
            };

            reader.readAsDataURL(oFile);
          } catch (e) {
            console.error("Upload preparation failed:", e);
            sap.m.MessageToast.show("Fehler beim Vorbereiten des Uploads");
          }
        },

        // Bei Änderung der Outbound-Auswahl: Destination automatisch setzen
        onOutboundRouteChange: function (oEvent) {
          const oItem = oEvent.getParameter("selectedItem");
          if (!oItem) return;

          const oCtx = oItem.getBindingContext();
          if (!oCtx) return;

          const oObj = oCtx.getObject && oCtx.getObject();
          const city =
            oObj && oObj.arrivalLocation && oObj.arrivalLocation.city;

          if (!city) return;

          const btCtx = this.getView().getBindingContext();
          if (btCtx) {
            btCtx.setProperty("destination", city);
            sap.m.MessageToast.show(`Ziel automatisch auf "${city}" gesetzt`);
          }
        },

        // Return-Handler (optional, falls du auch bei Rückflug die Destination setzen willst)
        onReturnFlightCriteriaChange: function () {
          // Hier könntest du auch Logic hinzufügen
        },

        // Transportmittel wechseln: Flight-Selects aktivieren/deaktivieren
        onMeansOfTransportChange: function () {
          this._suspendResumeFlightSelects();
        },

        _suspendResumeFlightSelects: function () {
          const ctx = this.getView().getBindingContext();
          if (!ctx) return;

          const mot = ctx.getProperty("meansOfTransport");
          const isFlight = mot === "Flug";

          // Flight-Route Selects finden (falls im Edit-Modus)
          const obSel = this.getView().byId("outboundRouteSelect");
          const retSel = this.getView().byId("returnRouteSelect");

          [obSel, retSel].forEach((sel) => {
            if (!sel) return;
            const b = sel.getBinding("items");
            if (!b) return;

            try {
              if (isFlight) {
                // Nur resumieren wenn suspended
                if (b.isSuspended()) {
                  b.resume();
                }
              } else {
                // Nur suspendieren wenn nicht suspended
                if (!b.isSuspended()) {
                  b.suspend();
                }
              }
            } catch (e) {
              console.warn("Binding suspend/resume failed:", e);
            }
          });
        },
      }
    );
  }
);
