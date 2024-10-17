// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for details.

import * as assert from "assert";
import { ErrorHelper } from "../../common/error/errorHelper";
import { InternalErrorCode } from "../../common/error/internalErrorCode";
import { ProjectVersionHelper } from "../../common/projectVersionHelper";
import { TargetPlatformHelper } from "../../common/targetPlatformHelper";
import { AndroidPlatform } from "../android/androidPlatform";
import { AppLauncher } from "../appLauncher";
import { TargetType } from "../generalPlatform";
import { PlatformType } from "../launchArgs";
import { getRunOptions } from "./util";
import { ReactNativeCommand } from "./util/reactNativeCommand";

export abstract class RunAndroid extends ReactNativeCommand {
    codeName = "runAndroid";
    label = "Run Android";

    error = ErrorHelper.getInternalError(InternalErrorCode.FailedToRunOnAndroid);

    async onBeforeExecute(): Promise<void> {
        await super.onBeforeExecute();
        assert(this.project);
        const nodeModulesRoot = this.project.getOrUpdateNodeModulesRoot();
        const versions = await ProjectVersionHelper.getReactNativePackageVersionsFromNodeModules(
            nodeModulesRoot,
        );
        this.project.setReactNativeVersions(versions);
        TargetPlatformHelper.checkTargetPlatformSupport(PlatformType.Android);
    }

    async baseFn(): Promise<void> {
        assert(this.project);
        await this.runAndroid(this.getTarget(), this.project);
    }

    protected getTarget(): TargetType {
        throw new Error("Not implemented");
    }

    protected async runAndroid(target: TargetType, project: AppLauncher) {
        const platform = new AndroidPlatform(getRunOptions(project, PlatformType.Android, target), {
            packager: project.getPackager(),
        });

        await platform.resolveMobileTarget(target);
        await platform.beforeStartPackager();
        await platform.startPackager();
        await platform.runApp(true);
        await platform.disableJSDebuggingMode();
    }
}

export class RunAndroidDevice extends RunAndroid {
    codeName = "runAndroidDevice";
    label = "Run Android on Device";

    protected getTarget(): TargetType {
        return TargetType.Device;
    }
}

export class RunAndroidSimulator extends RunAndroid {
    codeName = "runAndroidSimulator";
    label = "Run Android on Emulator";

    protected getTarget(): TargetType {
        return TargetType.Simulator;
    }
}

